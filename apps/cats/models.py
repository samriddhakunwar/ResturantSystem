"""
Models for the Café Cats module.

Entities:
    - Cat: a resident cat (or one looking for a home) with its profile.
    - AdoptionEnquiry: a guest asking to adopt one of the cats.
"""
from django.db import models
from django.utils.text import slugify

from utils.models import TimeStampedModel


class Cat(TimeStampedModel):
    """A cat who lives at (or is fostered by) the café."""

    class Sex(models.TextChoices):
        GIRL = "girl", "Girl"
        BOY = "boy", "Boy"

    class AdoptionStatus(models.TextChoices):
        RESIDENT = "resident", "Resident"
        AVAILABLE = "available", "Looking for a home"
        RESERVED = "reserved", "Reserved"
        ADOPTED = "adopted", "Adopted"

    name = models.CharField(max_length=60, help_text="The cat's name.")
    slug = models.SlugField(
        max_length=70,
        unique=True,
        blank=True,
        help_text="URL name, e.g. 'momo'. Generated from the name if left blank.",
    )
    photo = models.ImageField(
        upload_to="cats/%Y/%m/",
        blank=True,
        null=True,
        help_text="4:3 photo. A silhouette is shown until one is uploaded.",
    )
    photo_alt = models.CharField(
        max_length=150,
        blank=True,
        default="",
        help_text="Describe the photo, e.g. 'Momo curled up on a cushion'.",
    )
    age_years = models.PositiveSmallIntegerField(default=0)
    age_months = models.PositiveSmallIntegerField(default=0)
    sex = models.CharField(max_length=4, choices=Sex.choices, default=Sex.GIRL)
    breed_or_look = models.CharField(
        max_length=60,
        blank=True,
        default="",
        help_text="e.g. 'tabby', 'ginger', 'calico'.",
    )
    personality_tags = models.JSONField(
        default=list,
        blank=True,
        help_text='Up to three short tags, e.g. ["Sleepy", "Lap cat"].',
    )
    favourite_toy = models.CharField(max_length=100, blank=True, default="")
    likes = models.TextField(blank=True, default="")
    dislikes = models.TextField(blank=True, default="")
    bio = models.TextField(blank=True, default="")
    adoption_status = models.CharField(
        max_length=10,
        choices=AdoptionStatus.choices,
        default=AdoptionStatus.RESIDENT,
        db_index=True,
    )
    is_present_today = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Shown in 'Meet the cats here today' on the QR menu.",
    )
    display_order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta(TimeStampedModel.Meta):
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        """Generate a unique slug from the name on first save."""
        if not self.slug:
            base = slugify(self.name) or "cat"
            slug, n = base, 2
            while Cat.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug, n = f"{base}-{n}", n + 1
            self.slug = slug
        super().save(*args, **kwargs)


class AdoptionEnquiry(TimeStampedModel):
    """A guest's request to adopt a cat."""

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        CLOSED = "closed", "Closed"

    cat = models.ForeignKey(Cat, on_delete=models.CASCADE, related_name="enquiries")
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default="")
    message = models.TextField(blank=True, default="", max_length=2000)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]
        verbose_name_plural = "adoption enquiries"

    def __str__(self) -> str:
        return f"{self.name} → {self.cat.name} ({self.get_status_display()})"
