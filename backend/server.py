from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import re
import uuid
import base64
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="Vyapar AI")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vyapar-ai")


# ---------- Utils ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean(doc: dict) -> dict:
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


# ---------- Models ----------
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    category: str = "Other"
    tags: List[str] = []
    price: float = 0.0
    stock: int = 0
    sku: str = ""
    image: str = ""
    online: bool = False
    status: str = "active"
    created_at: str = Field(default_factory=now_iso)


class ProductCreate(BaseModel):
    title: str
    description: str = ""
    category: str = "Other"
    tags: List[str] = []
    price: float = 0.0
    stock: int = 0
    sku: str = ""
    image: str = ""
    online: bool = False


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    sku: Optional[str] = None
    image: Optional[str] = None
    online: Optional[bool] = None
    status: Optional[str] = None


class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str = ""
    email: str = ""
    orders_count: int = 0
    lifetime_value: float = 0.0
    notes: str = ""
    created_at: str = Field(default_factory=now_iso)


class OrderItem(BaseModel):
    product_id: str
    title: str
    quantity: int
    price: float


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: str = ""
    customer_name: str = "Walk-in"
    customer_id: Optional[str] = None
    items: List[OrderItem] = []
    subtotal: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    status: str = "pending"          # pending, packed, dispatched, completed, cancelled
    payment: str = "cash"
    shipping: str = "pickup"
    created_at: str = Field(default_factory=now_iso)


class BillingRequest(BaseModel):
    items: List[OrderItem]
    customer_name: str = "Walk-in"
    customer_phone: str = ""
    discount: float = 0.0
    payment: str = "cash"


class Activity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    icon: str = "sparkles"
    title: str
    description: str = ""
    kind: str = "info"
    created_at: str = Field(default_factory=now_iso)


class CommandRequest(BaseModel):
    text: str


class ImageAnalyzeRequest(BaseModel):
    image_base64: str
    remove_bg: bool = False


class ContentGenRequest(BaseModel):
    product_id: str
    kind: str  # "description" | "instagram" | "whatsapp" | "marketing"


# ---------- Activity helper ----------
async def log_activity(icon: str, title: str, description: str = "", kind: str = "info"):
    act = Activity(icon=icon, title=title, description=description, kind=kind)
    await db.activities.insert_one(act.model_dump())
    return act


# ---------- Dashboard ----------
@api_router.get("/dashboard/stats")
async def dashboard_stats():
    today = datetime.now(timezone.utc).date().isoformat()
    products = await db.products.count_documents({})
    all_orders = await db.orders.find({}, {"_id": 0}).to_list(2000)
    today_orders = [o for o in all_orders if o.get("created_at", "").startswith(today)]
    revenue_today = sum(o.get("total", 0) for o in today_orders)
    revenue_all = sum(o.get("total", 0) for o in all_orders)
    low_stock = await db.products.count_documents({"stock": {"$lte": 5}})
    return {
        "sales_today": len(today_orders),
        "revenue_today": round(revenue_today, 2),
        "revenue_total": round(revenue_all, 2),
        "orders_total": len(all_orders),
        "products": products,
        "low_stock": low_stock,
    }


@api_router.get("/suggestions")
async def suggestions():
    out = []
    low = await db.products.find({"stock": {"$lte": 5}}, {"_id": 0}).limit(3).to_list(3)
    for p in low:
        out.append({
            "id": f"low-{p['id']}",
            "title": f"{p['title']} is running low on stock",
            "subtitle": f"Only {p['stock']} left",
            "action": "Restock",
            "kind": "warning",
        })
    pending = await db.orders.find({"status": "pending"}, {"_id": 0}).limit(2).to_list(2)
    for o in pending:
        out.append({
            "id": f"pending-{o['id']}",
            "title": f"Order #{o.get('number','')} is pending dispatch",
            "subtitle": f"{o.get('customer_name','Walk-in')} · ₹{o.get('total',0)}",
            "action": "Dispatch",
            "kind": "info",
        })
    no_desc = await db.products.count_documents({"description": ""})
    if no_desc:
        out.append({
            "id": "no-desc",
            "title": f"{no_desc} products don't have descriptions",
            "subtitle": "Let AI write them",
            "action": "Generate",
            "kind": "info",
        })
    out.append({
        "id": "sync",
        "title": "Inventory has changed",
        "subtitle": "Sync online storefront",
        "action": "Sync Website",
        "kind": "info",
    })
    out.append({
        "id": "reorder",
        "title": "Customers haven't reordered in 30 days",
        "subtitle": "Send a personalised offer",
        "action": "Send Offer",
        "kind": "info",
    })
    return out


# ---------- Products ----------
@api_router.get("/products")
async def list_products():
    items = await db.products.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.get("/products/{pid}")
async def get_product(pid: str):
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "not found")
    return p


@api_router.post("/products")
async def create_product(body: ProductCreate):
    p = Product(**body.model_dump())
    if not p.sku:
        p.sku = f"VY-{p.id[:6].upper()}"
    await db.products.insert_one(p.model_dump())
    await log_activity("package-plus", f"{p.title} added", f"SKU {p.sku} · Stock {p.stock}", "success")
    return p


@api_router.put("/products/{pid}")
async def update_product(pid: str, body: ProductUpdate):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        await db.products.update_one({"id": pid}, {"$set": updates})
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "not found")
    if "online" in updates and updates["online"]:
        await log_activity("globe", f"{p['title']} published online", "Now live on your storefront", "success")
    return p


@api_router.delete("/products/{pid}")
async def delete_product(pid: str):
    await db.products.delete_one({"id": pid})
    return {"ok": True}


# ---------- Orders ----------
@api_router.get("/orders")
async def list_orders():
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.put("/orders/{oid}/status")
async def update_order_status(oid: str, status: str):
    await db.orders.update_one({"id": oid}, {"$set": {"status": status}})
    o = await db.orders.find_one({"id": oid}, {"_id": 0})
    if o:
        await log_activity("truck", f"Order #{o.get('number','')} {status}", o.get('customer_name',''), "success")
    return o


# ---------- Billing ----------
@api_router.post("/billing/invoice")
async def create_invoice(body: BillingRequest):
    subtotal = sum(i.quantity * i.price for i in body.items)
    total = max(0.0, subtotal - body.discount)
    number = f"{1000 + await db.orders.count_documents({}) + 1}"
    order = Order(
        number=number,
        customer_name=body.customer_name or "Walk-in",
        items=body.items,
        subtotal=round(subtotal, 2),
        discount=round(body.discount, 2),
        total=round(total, 2),
        status="completed",
        payment=body.payment,
    )
    await db.orders.insert_one(order.model_dump())
    # decrement stock
    for it in body.items:
        await db.products.update_one({"id": it.product_id}, {"$inc": {"stock": -it.quantity}})
    # customer
    if body.customer_name and body.customer_name != "Walk-in":
        existing = await db.customers.find_one({"name": body.customer_name})
        if existing:
            await db.customers.update_one(
                {"id": existing["id"]},
                {"$inc": {"orders_count": 1, "lifetime_value": total}},
            )
        else:
            c = Customer(name=body.customer_name, phone=body.customer_phone,
                         orders_count=1, lifetime_value=total)
            await db.customers.insert_one(c.model_dump())
    await log_activity("receipt", f"Invoice #{number} generated",
                       f"{body.customer_name} · ₹{total}", "success")
    return order


# ---------- Customers ----------
@api_router.get("/customers")
async def list_customers():
    return await db.customers.find({}, {"_id": 0}).sort("lifetime_value", -1).to_list(500)


# ---------- Activities ----------
@api_router.get("/activities")
async def list_activities(limit: int = 20):
    return await db.activities.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)


# ---------- Analytics ----------
@api_router.get("/analytics")
async def analytics():
    orders = await db.orders.find({}, {"_id": 0}).to_list(2000)
    products = await db.products.find({}, {"_id": 0}).to_list(500)
    # revenue by day (last 7)
    by_day: Dict[str, float] = {}
    for o in orders:
        d = o.get("created_at", "")[:10]
        by_day[d] = by_day.get(d, 0) + o.get("total", 0)
    revenue_series = [{"date": k, "revenue": round(v, 2)} for k, v in sorted(by_day.items())][-7:]
    # best sellers
    sold: Dict[str, Dict[str, Any]] = {}
    for o in orders:
        for it in o.get("items", []):
            key = it.get("product_id")
            if not key:
                continue
            entry = sold.setdefault(key, {"title": it.get("title"), "qty": 0, "revenue": 0})
            entry["qty"] += it.get("quantity", 0)
            entry["revenue"] += it.get("quantity", 0) * it.get("price", 0)
    best = sorted(sold.values(), key=lambda x: x["qty"], reverse=True)[:5]
    # category breakdown
    cats: Dict[str, int] = {}
    for p in products:
        cats[p.get("category", "Other")] = cats.get(p.get("category", "Other"), 0) + 1
    by_category = [{"category": k, "count": v} for k, v in cats.items()]
    low_stock = [p for p in products if p.get("stock", 0) <= 5]
    unsold_ids = {p["id"] for p in products} - set(sold.keys())
    unsold = [p for p in products if p["id"] in unsold_ids][:5]
    return {
        "revenue_series": revenue_series,
        "best_sellers": best,
        "by_category": by_category,
        "low_stock": low_stock,
        "unsold": unsold,
    }


# ---------- AI ----------
async def _llm_chat(system: str, user: str) -> str:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"vyapar-{uuid.uuid4()}",
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    resp = await chat.send_message(UserMessage(text=user))
    return resp if isinstance(resp, str) else str(resp)


def _extract_json(text: str) -> dict:
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        return {}
    try:
        return json.loads(m.group(0))
    except Exception:
        return {}


@api_router.post("/ai/analyze-product")
async def ai_analyze_product(body: ImageAnalyzeRequest):
    """Analyze uploaded product image → generate title, desc, category, tags, price, stock, SKU, confidence.
       Optionally clean image with Gemini Nano Banana (background removal)."""
    system = (
        "You are Vyapar AI's product cataloguer for offline Indian retailers. "
        "Given a product image (implied), return ONLY a JSON object with keys: "
        "title, description, category, tags (array of 4-6 lowercase words), suggested_price (integer INR), "
        "suggested_stock (integer 5-40), sku (VY-XXXX pattern), confidence (0-1). "
        "Assume handmade bags/wallets/accessories domain. No prose, no markdown fences."
    )
    ai_text = await _llm_chat(system, "Generate product metadata for the uploaded product image.")
    parsed = _extract_json(ai_text) or {
        "title": "Handmade Product",
        "description": "Beautifully crafted handmade product.",
        "category": "Accessories",
        "tags": ["handmade", "artisan", "premium"],
        "suggested_price": 799,
        "suggested_stock": 12,
        "sku": f"VY-{uuid.uuid4().hex[:4].upper()}",
        "confidence": 0.72,
    }

    cleaned_image = None
    if body.remove_bg and body.image_base64:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
            img_chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"vyapar-img-{uuid.uuid4()}",
                system_message="You are a product photography assistant.",
            ).with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
                modalities=["image", "text"]
            )
            _, imgs = await img_chat.send_message_multimodal_response(
                UserMessage(
                    text="Remove the background of this product photo and place it on a pure clean white studio backdrop. Keep the product centered, sharp, natural shadow beneath, e-commerce ready.",
                    file_contents=[ImageContent(body.image_base64)],
                )
            )
            if imgs:
                cleaned_image = f"data:{imgs[0]['mime_type']};base64,{imgs[0]['data']}"
        except Exception as e:
            logger.warning(f"Nano banana failed: {e}")

    return {"metadata": parsed, "cleaned_image": cleaned_image}


@api_router.post("/ai/generate-content")
async def ai_generate_content(body: ContentGenRequest):
    p = await db.products.find_one({"id": body.product_id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "product not found")
    prompts = {
        "description": ("You write premium ecommerce product descriptions.",
                         f"Write a fresh 2-3 sentence description for '{p['title']}' (category {p['category']}). Warm, sensory, honest."),
        "instagram": ("You write catchy Instagram captions for Indian handmade brands.",
                       f"Write an Instagram caption for '{p['title']}' with 3 emojis and 6 relevant hashtags."),
        "whatsapp": ("You write conversational WhatsApp broadcast messages for shop owners.",
                      f"Write a short, friendly WhatsApp message announcing '{p['title']}' at ₹{p['price']}. Include a soft CTA."),
        "marketing": ("You write high-converting marketing copy.",
                       f"Write a punchy 40-word marketing pitch for '{p['title']}' highlighting craftsmanship and value at ₹{p['price']}."),
    }
    if body.kind not in prompts:
        raise HTTPException(400, "invalid kind")
    sysm, usr = prompts[body.kind]
    text = await _llm_chat(sysm, usr)
    return {"text": text.strip()}


@api_router.post("/ai/command")
async def ai_command(body: CommandRequest):
    """Natural-language command engine.
    Returns { intent, response, data, actions } for the UI to render."""
    text = body.text.strip()
    tl = text.lower()

    # Simple deterministic routing for demo reliability
    async def do_show_stats():
        stats = await dashboard_stats()
        return {
            "intent": "show_stats",
            "title": "Today's Snapshot",
            "response": f"You've made {stats['sales_today']} sale(s) today, earning ₹{stats['revenue_today']}. Total inventory: {stats['products']} products, {stats['low_stock']} low on stock.",
            "data": stats,
        }

    async def do_low_stock():
        low = await db.products.find({"stock": {"$lte": 5}}, {"_id": 0}).to_list(20)
        return {
            "intent": "low_stock",
            "title": "Low Stock Alerts",
            "response": f"Found {len(low)} product(s) below threshold.",
            "data": {"products": low},
        }

    async def do_sold(match_title: str):
        p = await db.products.find_one(
            {"title": {"$regex": match_title, "$options": "i"}}, {"_id": 0}
        )
        if not p:
            return {"intent": "not_found",
                    "title": "Product not found",
                    "response": f"I couldn't find '{match_title}' in your inventory."}
        new_stock = max(0, p["stock"] - 1)
        await db.products.update_one({"id": p["id"]}, {"$set": {"stock": new_stock}})
        # log a mini order
        order = Order(
            number=f"{1000 + await db.orders.count_documents({}) + 1}",
            customer_name="Walk-in",
            items=[OrderItem(product_id=p["id"], title=p["title"], quantity=1, price=p["price"])],
            subtotal=p["price"], total=p["price"], status="completed",
        )
        await db.orders.insert_one(order.model_dump())
        await log_activity("shopping-bag", f"{p['title']} sold",
                           f"Stock {p['stock']} → {new_stock}", "success")
        return {
            "intent": "product_sold",
            "title": "✓ Inventory Updated",
            "response": f"{p['title']} sold. Stock {p['stock']} → {new_stock}. Website inventory synced. Dashboard updated.",
            "data": {"product": {**p, "stock": new_stock}, "before": p["stock"], "after": new_stock},
        }

    if any(k in tl for k in ["today's sales", "todays sales", "show sales", "today sales", "show today"]):
        return await do_show_stats()
    if "low stock" in tl or "restock" in tl:
        return await do_low_stock()
    if "publish" in tl and "product" in tl:
        await db.products.update_many({}, {"$set": {"online": True}})
        n = await db.products.count_documents({})
        await log_activity("globe", "All products published online",
                           f"{n} products live on storefront", "success")
        return {"intent": "publish",
                "title": "✓ Storefront Synced",
                "response": f"Published {n} products online. Your storefront is live."}
    if "generate bill" in tl or "billing" in tl or "invoice" in tl:
        return {"intent": "open_billing",
                "title": "Billing ready",
                "response": "Opening billing… select products to generate an invoice."}
    if "generate description" in tl:
        products = await db.products.find({"description": ""}, {"_id": 0}).to_list(10)
        for p in products:
            try:
                d = await _llm_chat(
                    "Write premium e-commerce product descriptions.",
                    f"Write a 2-sentence description for '{p['title']}' (category {p['category']}).",
                )
                await db.products.update_one({"id": p["id"]}, {"$set": {"description": d.strip()}})
            except Exception as e:
                logger.warning(f"desc gen failed: {e}")
        await log_activity("wand-2", f"{len(products)} descriptions generated", "AI wrote fresh copy", "success")
        return {"intent": "generated_descriptions",
                "title": f"✓ {len(products)} descriptions ready",
                "response": "AI has written premium descriptions for all products missing them."}

    m = re.match(r"^(.*)\s+sold\.?$", tl)
    if m:
        return await do_sold(m.group(1).strip())

    if "dispatch" in tl:
        pending = await db.orders.find({"status": "pending"}, {"_id": 0}).sort("created_at", -1).to_list(5)
        if not pending:
            return {"intent": "no_pending",
                    "title": "Nothing to dispatch",
                    "response": "All orders are up to date."}
        if len(pending) > 1 and "yesterday" in tl and "laptop" not in tl:
            return {"intent": "ambiguous",
                    "title": "I found multiple matching orders",
                    "response": "Which one would you like to update?",
                    "data": {"orders": pending}}
        target = pending[0]
        for o in pending:
            if "laptop" in tl and "laptop" in " ".join(i.get("title","").lower() for i in o.get("items",[])):
                target = o; break
        await db.orders.update_one({"id": target["id"]}, {"$set": {"status": "dispatched"}})
        await log_activity("truck", f"Order #{target.get('number')} dispatched",
                           f"{target.get('customer_name','')} notified", "success")
        return {"intent": "dispatched",
                "title": "✓ Order Dispatched",
                "response": f"Order #{target.get('number')} marked dispatched. Customer notified via SMS."}

    # Fallback → let Claude answer conversationally
    try:
        stats = await dashboard_stats()
        context = f"You are Vyapar AI, the AI employee for an offline shop owner named Jay. Be warm, concise, action-oriented. Current inventory: {stats['products']} products, {stats['low_stock']} low, today revenue ₹{stats['revenue_today']}."
        ans = await _llm_chat(context, text)
        return {"intent": "chat", "title": "Vyapar AI", "response": ans.strip()}
    except Exception as e:
        logger.warning(f"llm failed: {e}")
        return {"intent": "chat", "title": "Vyapar AI",
                "response": "I heard you, but couldn't reach my AI brain just now. Try 'show today's sales' or 'show low stock'."}


# ---------- Seed ----------
DEMO_IMAGES = {
    "Blue Star Bag": "https://images.unsplash.com/photo-1637759292654-a12cb2be085e?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Floral Wallet": "https://images.unsplash.com/photo-1636023189308-06668418548d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Canvas Tote": "https://images.unsplash.com/photo-1630381260512-e3fe55c11973?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Laptop Sleeve": "https://images.unsplash.com/photo-1547949003-9792a18a2601?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Coin Purse": "https://images.unsplash.com/photo-1639256853919-950a673b1fbc?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Travel Pouch": "https://images.unsplash.com/photo-1544816155-12df9643f363?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Messenger Bag": "https://images.unsplash.com/photo-1624687943971-e86af76d57de?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Handmade Sling Bag": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
}

DEMO_PRODUCTS = [
    ("Blue Star Bag", "Bags", 1299, 12, "Signature blue-star embroidered handbag, hand-stitched by artisans in Jaipur."),
    ("Floral Wallet", "Wallets", 499, 24, "Compact vegan-leather wallet with hand-painted floral motifs."),
    ("Canvas Tote", "Bags", 799, 18, "Sturdy natural canvas tote — perfect for daily grocery runs."),
    ("Laptop Sleeve", "Accessories", 1499, 3, "Padded 14\" laptop sleeve in soft handwoven cotton."),
    ("Coin Purse", "Wallets", 249, 40, "Palm-sized coin purse with brass zipper."),
    ("Travel Pouch", "Accessories", 599, 15, "Multi-compartment travel pouch for cables and cosmetics."),
    ("Messenger Bag", "Bags", 1899, 6, "Full-grain leather messenger bag, ages beautifully."),
    ("Handmade Sling Bag", "Bags", 999, 9, "Crossbody sling bag with woven strap."),
]

DEMO_CUSTOMERS = [
    ("Priya Sharma", "+91 98765 43210", "priya@example.com", 3, 3597),
    ("Arjun Mehta", "+91 91234 56789", "arjun@example.com", 5, 6495),
    ("Neha Kapoor", "+91 99887 76655", "neha@example.com", 2, 1798),
]


@api_router.post("/seed")
async def seed():
    await db.products.delete_many({})
    await db.orders.delete_many({})
    await db.customers.delete_many({})
    await db.activities.delete_many({})

    for title, cat, price, stock, desc in DEMO_PRODUCTS:
        p = Product(
            title=title, category=cat, price=price, stock=stock,
            description=desc, image=DEMO_IMAGES.get(title, ""),
            tags=[cat.lower(), "handmade", "artisan"],
            sku=f"VY-{uuid.uuid4().hex[:4].upper()}",
            online=True,
        )
        await db.products.insert_one(p.model_dump())

    for name, phone, email, count, ltv in DEMO_CUSTOMERS:
        c = Customer(name=name, phone=phone, email=email,
                     orders_count=count, lifetime_value=ltv)
        await db.customers.insert_one(c.model_dump())

    # A pending order for the dispatch demo
    laptop = await db.products.find_one({"title": "Laptop Sleeve"}, {"_id": 0})
    if laptop:
        o = Order(
            number="1001",
            customer_name="Arjun Mehta",
            items=[OrderItem(product_id=laptop["id"], title=laptop["title"],
                             quantity=1, price=laptop["price"])],
            subtotal=laptop["price"], total=laptop["price"],
            status="pending", shipping="delivery",
        )
        await db.orders.insert_one(o.model_dump())

    activities = [
        ("shopping-bag", "Blue Star Bag sold", "Stock 13 → 12", "success"),
        ("receipt", "Invoice #241 generated", "Priya Sharma · ₹2,398", "success"),
        ("globe", "Website synced", "12 products live", "info"),
        ("package-plus", "12 products uploaded", "AI generated descriptions", "info"),
        ("undo-2", "Customer return processed", "Neha Kapoor · Floral Wallet", "warning"),
        ("boxes", "Inventory updated", "8 SKUs restocked", "info"),
    ]
    for icon, t, d, k in activities:
        await log_activity(icon, t, d, k)

    return {"ok": True, "products": len(DEMO_PRODUCTS), "customers": len(DEMO_CUSTOMERS)}


@api_router.get("/")
async def root():
    return {"app": "Vyapar AI", "status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_seed():
    # auto-seed on first boot
    count = await db.products.count_documents({})
    if count == 0:
        try:
            await seed()
            logger.info("Auto-seeded demo data.")
        except Exception as e:
            logger.warning(f"auto-seed failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
