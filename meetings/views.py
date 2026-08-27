import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import Meeting


@ensure_csrf_cookie
def home(request):
    return render(request, "meetings/index.html")


def save_meeting(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "POST request required"},
            status=405
        )

    try:
        data = json.loads(request.body)

        title = data.get("title", "").strip()
        meeting_date = data.get("date", "")

        if not title:
            return JsonResponse(
                {"error": "Meeting title is required"},
                status=400
            )

        if not meeting_date:
            return JsonResponse(
                {"error": "Meeting date is required"},
                status=400
            )

        meeting = Meeting.objects.create(
            title=title,
            meeting_date=meeting_date,
            attendees=data.get("attendees", ""),
            transcript=data.get("transcript", ""),
            summary=data.get("summary", "")
        )

        return JsonResponse({
            "success": True,
            "id": meeting.id,
            "message": "Meeting saved successfully"
        })

    except Exception as error:

        return JsonResponse(
            {"error": str(error)},
            status=500
        )