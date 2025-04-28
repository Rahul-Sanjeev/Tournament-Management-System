from django.contrib import admin
from django.forms import ModelForm
from django.forms.widgets import DateInput

from .models import Event, Match, Participant, Tournament


class TournamentAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'venue', 'status', 'created_by')
    list_filter = ('status', 'date')
    search_fields = ('name', 'venue')
    date_hierarchy = 'date'

class EventAdmin(admin.ModelAdmin):
    list_display = ('tournament', 'category', 'age_category', 'gender', 'weight_category', 'status')
    list_filter = ('category', 'age_category', 'gender', 'status')
    search_fields = ('tournament__name',)

class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'tournament', 'gender', 'age', 'weight', 'belt_rank', 'club')
    list_filter = ('gender', 'belt_rank', 'is_team_event')
    search_fields = ('first_name', 'last_name', 'club', 'country')
    filter_horizontal = ('events',)

class MatchAdmin(admin.ModelAdmin):
    list_display = ('event', 'round_number', 'match_number', 'competitor1', 'competitor2', 'winner', 'status')
    list_filter = ('status', 'round_number', 'event__category')
    search_fields = ('competitor1__first_name', 'competitor1__last_name', 
                    'competitor2__first_name', 'competitor2__last_name')

# Register models
admin.site.register(Tournament, TournamentAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(Participant, ParticipantAdmin)
admin.site.register(Match, MatchAdmin)
