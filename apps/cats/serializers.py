"""
Serializers for the Café Cats module.
"""
from rest_framework import serializers

from .models import AdoptionEnquiry, Cat

PUBLIC_CAT_FIELDS = [
    "name",
    "slug",
    "photo",
    "photo_alt",
    "age_years",
    "age_months",
    "sex",
    "breed_or_look",
    "personality_tags",
    "favourite_toy",
    "likes",
    "dislikes",
    "bio",
    "adoption_status",
    "is_present_today",
]


class CatSerializer(serializers.ModelSerializer):
    """Staff CRUD for cats (accepts multipart for photo upload)."""

    class Meta:
        model = Cat
        fields = ["id", *PUBLIC_CAT_FIELDS, "display_order", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {"slug": {"required": False}}

    def validate_personality_tags(self, value):
        if not isinstance(value, list) or not all(isinstance(t, str) for t in value):
            raise serializers.ValidationError("Must be a list of short text tags.")
        if len(value) > 3:
            raise serializers.ValidationError("Use at most three tags.")
        return [t.strip()[:30] for t in value if t.strip()]


class PublicCatSerializer(serializers.ModelSerializer):
    """What guests see about a cat."""

    class Meta:
        model = Cat
        fields = PUBLIC_CAT_FIELDS
        read_only_fields = fields


class AdoptionEnquirySerializer(serializers.ModelSerializer):
    """Staff view of adoption enquiries; only ``status`` is editable."""

    cat_name = serializers.CharField(source="cat.name", read_only=True)

    class Meta:
        model = AdoptionEnquiry
        fields = [
            "id",
            "cat",
            "cat_name",
            "name",
            "phone",
            "email",
            "message",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "cat", "name", "phone", "email", "message", "created_at"]


class PublicAdoptionEnquirySerializer(serializers.ModelSerializer):
    """A guest's adoption enquiry form."""

    class Meta:
        model = AdoptionEnquiry
        fields = ["name", "phone", "email", "message"]
