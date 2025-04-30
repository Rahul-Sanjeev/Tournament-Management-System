from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Event, Match, Participant, Tournament, Bracket


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class TournamentSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Tournament
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')


class ParticipantListSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(read_only=True)
    age_category = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Participant
        fields = (
            'id', 'full_name', 'age', 'gender', 'weight', 'belt_rank',
            'club', 'country', 'age_category', 'is_team_event', 'team_name'
        )


class ParticipantDetailSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(read_only=True)
    age_category = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    events = serializers.PrimaryKeyRelatedField(many=True, queryset=Event.objects.all())

    class Meta:
        model = Participant
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    participants = ParticipantListSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = '__all__'

    def validate(self, data):
        """
        Check that weight category is only set for Kumite events
        """
        if 'KATA' in data.get('category', '') and data.get('weight_category'):
            raise serializers.ValidationError(
                "Weight category should not be set for Kata events"
            )
        return data


class MatchSerializer(serializers.ModelSerializer):
    competitor1_name = serializers.CharField(
        source='competitor1.full_name', read_only=True
    )
    competitor2_name = serializers.CharField(
        source='competitor2.full_name', read_only=True
    )

    class Meta:
        model = Match
        fields = '__all__'


class BracketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bracket
        fields = ['id', 'event', 'name', 'max_participants', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']



# from rest_framework import serializers

# from .models import Event, Match, Participant, Tournament


# class ParticipantListSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Participant
#         fields = ['id', 'full_name', 'is_team_event', 'team_name', 'club', 'belt_rank']

# class ParticipantDetailSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Participant
#         fields = '__all__'

# class EventSerializer(serializers.ModelSerializer):
#     participants = ParticipantListSerializer(many=True, read_only=True)

#     class Meta:
#         model = Event
#         fields = ['id', 'tournament', 'category', 'age_category', 'gender', 'weight_category', 'status', 'participants']

# class MatchSerializer(serializers.ModelSerializer):
#     competitor1 = ParticipantListSerializer(read_only=True)
#     competitor2 = ParticipantListSerializer(read_only=True)

#     class Meta:
#         model = Match
#         fields = ['id', 'event', 'round_number', 'match_number', 'competitor1', 'competitor2', 'status']

# class BracketSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Event
#         fields = ['id', 'category', 'participants']

# class TournamentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Tournament
#         fields = '__all__'