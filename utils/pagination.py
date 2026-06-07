"""
Shared pagination classes for the Restaurant POS System.
"""
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """
    Default pagination: 20 items per page, max 100.
    Clients can override via ``?page_size=N`` query param.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
