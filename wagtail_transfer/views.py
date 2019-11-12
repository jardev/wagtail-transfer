import uuid

from django.contrib.contenttypes.models import ContentType
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from wagtail.core.models import Page

from .models import IDMapping
from .serializers import get_model_serializer


def pages_for_export(request, root_page_id):
    root_page = get_object_or_404(Page, id=root_page_id)

    page_content_type = ContentType.objects.get_for_model(Page)

    pages = root_page.get_descendants(inclusive=True).specific()

    ids_for_import = [
        ['wagtailcore.page', page.pk] for page in pages
    ]

    objects = []
    mappings = []

    for (i, page) in enumerate(pages):
        id_mapping, created = IDMapping.objects.get_or_create(
            content_type=page_content_type, local_id=page.pk,
            defaults={'uid': uuid.uuid1(clock_seq=i)}
        )
        mappings.append(
            ['wagtailcore.page', page.pk, id_mapping.uid]
        )

        serializer = get_model_serializer(type(page))
        objects.append(serializer.serialize(page))

    return JsonResponse({
        'ids_for_import': ids_for_import,
        'mappings': mappings,
        'objects': objects,
    }, json_dumps_params={'indent': 2})
