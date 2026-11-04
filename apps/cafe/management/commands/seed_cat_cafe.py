"""
Management command to seed the Whisker & Brew demo café.

Idempotent: rows are matched on their natural keys (category name, item
name, cat slug, table number, booking name + date) and updated in place,
so running it again never duplicates anything.

Usage:
    python manage.py seed_cat_cafe
"""
import datetime
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.bookings.models import Booking
from apps.cats.models import Cat
from apps.menu.models import Category, MenuItem
from apps.tables.models import Table

CATEGORIES = [
    ("Purr-over Coffee", "Single-origin beans, roasted in Kathmandu, served slow."),
    ("Tea & Mew-lk", "Chiya, matcha and milky teas."),
    ("Pawstries & Bakes", "Baked here every morning."),
    ("Meals Fur-real", "Proper food for a long visit."),
    ("Cool Cat Drinks", "Cold coffee, shakes and coolers."),
    ("Kitten Treats", "Smaller plates for under-12s."),
]

# (category, name, description, price, dietary_tags, featured, cat pick slug)
ITEMS = [
    ("Purr-over Coffee", "Catpuccino", "Double shot, velvety foam and a cocoa paw on top.", 280, ["veg", "contains_dairy"], True, "momo"),
    ("Purr-over Coffee", "Black Cat Americano", "Double espresso topped up with hot water.", 220, ["vegan"], False, None),
    ("Purr-over Coffee", "Flat Whisker", "Ristretto with a thin layer of steamed milk.", 300, ["veg", "contains_dairy"], False, None),
    ("Purr-over Coffee", "Mew-cha", "Espresso, dark chocolate and steamed milk.", 330, ["veg", "contains_dairy"], False, "pepper"),
    ("Purr-over Coffee", "Pour-over of the Day", "Hand-brewed single origin; ask us which bean.", 350, ["vegan"], False, None),
    ("Tea & Mew-lk", "Purrfect Masala Chiya", "Milky black tea with ginger, cardamom and clove.", 120, ["veg", "contains_dairy"], True, "chiya"),
    ("Tea & Mew-lk", "Meow-cha Latte", "Ceremonial matcha whisked into steamed milk.", 320, ["veg", "contains_dairy"], False, None),
    ("Tea & Mew-lk", "Lemon Honey Hiss-cus", "Hibiscus, lemon and wild honey, served hot.", 180, ["veg", "gluten_free"], False, None),
    ("Tea & Mew-lk", "Ilam Tail-tea", "First-flush Ilam black tea, no milk.", 150, ["vegan", "gluten_free"], False, None),
    ("Pawstries & Bakes", "Whisker Waffles", "Belgian waffle, maple syrup and whipped butter.", 380, ["veg", "contains_dairy"], True, "biscuit"),
    ("Pawstries & Bakes", "Kitten Mitten Cookies", "Two brown-butter chocolate chip cookies.", 180, ["veg", "contains_dairy"], False, None),
    ("Pawstries & Bakes", "Banana Nap Bread", "Toasted slice of banana walnut loaf.", 220, ["veg", "contains_nuts"], False, None),
    ("Pawstries & Bakes", "Croissant Curl", "All-butter croissant, jam on the side.", 240, ["veg", "contains_dairy"], False, None),
    ("Pawstries & Bakes", "Carrot Cake Purrsuasion", "Spiced carrot cake with cream cheese frosting.", 320, ["veg", "contains_dairy", "contains_nuts"], False, "mishri"),
    ("Meals Fur-real", "Tuna Melt Paws", "Toasted sourdough, tuna, cheddar and pickled onion.", 450, ["contains_dairy"], False, None),
    ("Meals Fur-real", "Paw-ffle Fries", "Waffle-cut fries with garlic mayo.", 250, ["veg"], False, None),
    ("Meals Fur-real", "Chicken Momo Meow-dley", "Ten steamed chicken momos with tomato achar.", 360, [], True, "momo"),
    ("Meals Fur-real", "Veg Thukpa Snooze", "Noodle soup with seasonal vegetables.", 320, ["vegan"], False, None),
    ("Meals Fur-real", "Big Cat Breakfast", "Eggs your way, toast, beans, mushrooms and potatoes.", 550, ["veg", "contains_dairy"], False, None),
    ("Cool Cat Drinks", "Iced Catpuccino", "Double shot over ice with cold milk.", 300, ["veg", "contains_dairy"], False, None),
    ("Cool Cat Drinks", "Mango Lassi Leap", "Alphonso mango blended with yoghurt.", 260, ["veg", "gluten_free", "contains_dairy"], False, "bhoto"),
    ("Cool Cat Drinks", "Cold Brew Prowl", "Steeped 18 hours, served black over ice.", 320, ["vegan", "gluten_free"], False, None),
    ("Kitten Treats", "Mini Mouse Pancakes", "Three small pancakes with honey and banana.", 280, ["veg", "contains_dairy"], False, None),
    ("Kitten Treats", "Fish-bone Fish Fingers", "Crumbed fish fingers with a few fries.", 340, [], False, None),
    ("Kitten Treats", "Babycino", "Warm frothed milk with cocoa dust. No coffee.", 100, ["veg", "gluten_free", "contains_dairy"], False, None),
]

# Invented cats — no real animals or known characters.
CATS = [
    dict(slug="momo", name="Momo", age_years=2, sex="girl", breed_or_look="tabby",
         personality_tags=["Sleepy", "Lap cat"], favourite_toy="Feather wand",
         likes="Warm laps, the sunny window seat", dislikes="The milk steamer",
         bio="Momo was our first resident. She'll find the softest lap in the room.",
         adoption_status="resident", is_present_today=True, display_order=1),
    dict(slug="chiya", name="Chiya", age_months=8, sex="boy", breed_or_look="ginger",
         personality_tags=["Playful", "Yarn hunter"], favourite_toy="Yarn ball",
         likes="Chasing string, climbing shelves", dislikes="Naps that last too long",
         bio="Chiya came to us from a Patan rescue and hasn't stopped bouncing since.",
         adoption_status="available", is_present_today=True, display_order=2),
    dict(slug="biscuit", name="Biscuit", age_years=4, sex="boy", breed_or_look="cream",
         personality_tags=["Gentle", "Curious"], favourite_toy="Cardboard box",
         likes="Head scratches, boxes", dislikes="Loud voices",
         bio="Biscuit greets every guest at the door, then supervises from a box.",
         adoption_status="resident", is_present_today=True, display_order=3),
    dict(slug="mishri", name="Mishri", age_years=5, sex="girl", breed_or_look="calico",
         personality_tags=["Shy", "Treat-motivated"], favourite_toy="Toy mouse",
         likes="Quiet corners, treats", dislikes="Being picked up",
         bio="Mishri warms up slowly. Sit still and she may choose you.",
         adoption_status="available", is_present_today=False, display_order=4),
    dict(slug="bhoto", name="Bhoto", age_years=3, sex="boy", breed_or_look="black",
         personality_tags=["Chatty", "Brave"], favourite_toy="Crinkle ball",
         likes="Talking back, high perches", dislikes="Closed doors",
         bio="Bhoto has opinions and will share all of them with you.",
         adoption_status="reserved", is_present_today=True, display_order=5),
    dict(slug="pepper", name="Pepper", age_years=1, age_months=6, sex="girl",
         breed_or_look="tuxedo", personality_tags=["Zoomies", "Cuddly"],
         favourite_toy="Laser dot", likes="Running laps at 4 pm", dislikes="Baths",
         bio="Pepper runs on two speeds: full zoom and fast asleep.",
         adoption_status="available", is_present_today=True, display_order=6),
]

TABLES = [
    (1, "Window nook", 2), (2, "", 2), (3, "", 4), (4, "", 4),
    (5, "Cushion corner", 6), (6, "", 4), (7, "", 2), (8, "Cat-tree table", 6),
]


class Command(BaseCommand):
    help = "Seed the Whisker & Brew demo café (categories, menu, cats, tables, bookings)."

    @transaction.atomic
    def handle(self, *args, **options):
        cats = {}
        for data in CATS:
            fields = {"age_years": 0, "age_months": 0, **data}
            slug = fields.pop("slug")
            cats[slug], _ = Cat.objects.update_or_create(slug=slug, defaults=fields)

        categories = {}
        for order, (name, description) in enumerate(CATEGORIES, start=1):
            categories[name], _ = Category.objects.update_or_create(
                name=name,
                defaults={"description": description, "display_order": order, "is_active": True},
            )

        for order, (cat_name, name, desc, price, tags, featured, pick) in enumerate(ITEMS):
            MenuItem.objects.update_or_create(
                category=categories[cat_name],
                name=name,
                defaults={
                    "description": desc,
                    "price": Decimal(price),
                    "dietary_tags": tags,
                    "is_featured": featured,
                    "recommended_by": cats.get(pick),
                    "display_order": order,
                    "is_available": True,
                },
            )
        # One sold-out item so the "Napping · sold out" state is visible.
        MenuItem.objects.filter(name="Carrot Cake Purrsuasion").update(is_available=False)

        for number, label, seats in TABLES:
            Table.objects.update_or_create(
                number=number, defaults={"label": label, "seats": seats}
            )

        today = timezone.localdate()
        bookings = [
            ("Asha Gurung", "9841000001", 1, "11:00", 3, 1, "confirmed"),
            ("Rohan Shrestha", "9841000002", 1, "14:00", 2, 0, "pending"),
            ("Pema Lama", "9841000003", 2, "10:00", 5, 2, "confirmed"),
            ("Sita Karki", "9841000004", 3, "16:00", 4, 0, "pending"),
        ]
        for name, phone, days, slot, party, kids, status in bookings:
            Booking.objects.update_or_create(
                name=name,
                date=today + datetime.timedelta(days=days),
                defaults={
                    "phone": phone,
                    "slot_start": datetime.time.fromisoformat(slot),
                    "party_size": party,
                    "kids_count": kids,
                    "accepted_rules": True,
                    "status": status,
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(CATEGORIES)} categories, {len(ITEMS)} items, {len(CATS)} cats, "
                f"{len(TABLES)} tables and {len(bookings)} bookings."
            )
        )
