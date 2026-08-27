from django.urls import path
from . import views


urlpatterns = [

    path(
        "",
        views.home,
        name="home"
    ),

    path(
        "api/meetings/save/",
        views.save_meeting,
        name="save_meeting"
    ),

]