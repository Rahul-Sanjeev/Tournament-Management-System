# import math

# from django.contrib.auth import authenticate
# from django.db import transaction
# from django.shortcuts import get_object_or_404, render
# from rest_framework import status, viewsets
# from rest_framework.decorators import action, api_view, permission_classes
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.response import Response
# from rest_framework_simplejwt.tokens import RefreshToken

# from .models import Event, Match, Participant, Tournament
# from .serializers import (BracketSerializer, EventSerializer, MatchSerializer,
#                           ParticipantDetailSerializer,
#                           ParticipantListSerializer, TournamentSerializer)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# def login(request):
#     username = request.data.get('username')
#     password = request.data.get('password')

#     if not username or not password:
#         return Response({'error': 'Please provide both username and password'}, 
#                        status=status.HTTP_400_BAD_REQUEST)

#     user = authenticate(username=username, password=password)
#     if user:
#         refresh = RefreshToken.for_user(user)
#         return Response({
#             'token': str(refresh.access_token),
#             'refresh': str(refresh),
#             'user': {
#                 'id': user.id,
#                 'username': user.username,
#                 'email': user.email
#             }
#         })
#     return Response({'error': 'Invalid credentials'}, 
#                    status=status.HTTP_401_UNAUTHORIZED)



# class TournamentViewSet(viewsets.ModelViewSet):
#     queryset = Tournament.objects.all()
#     serializer_class = TournamentSerializer
#     permission_classes = [IsAuthenticated]

#     def perform_create(self, serializer):
#         serializer.save(created_by=self.request.user)

#     @action(detail=True, methods=['post'])
#     def add_sample_participants(self, request, pk=None):
#         tournament = self.get_object()
#         from datetime import date, timedelta

#         # Sample data for participants
#         participants_data = [
#             {
#                 "first_name": "John",
#                 "last_name": "Smith",
#                 "date_of_birth": date(2005, 5, 15),
#                 "gender": "M",
#                 "weight": 65.5,
#                 "belt_rank": "1DAN",
#                 "club": "Dragon Dojo",
#                 "country": "USA"
#             },
#             {
#                 "first_name": "Emma",
#                 "last_name": "Johnson",
#                 "date_of_birth": date(2006, 3, 20),
#                 "gender": "F",
#                 "weight": 55.0,
#                 "belt_rank": "1DAN",
#                 "club": "Tiger Academy",
#                 "country": "UK"
#             },
#             {
#                 "first_name": "Michael",
#                 "last_name": "Chen",
#                 "date_of_birth": date(2005, 8, 10),
#                 "gender": "M",
#                 "weight": 70.2,
#                 "belt_rank": "2DAN",
#                 "club": "Phoenix Karate",
#                 "country": "Canada"
#             },
#             {
#                 "first_name": "Sarah",
#                 "last_name": "Williams",
#                 "date_of_birth": date(2006, 1, 5),
#                 "gender": "F",
#                 "weight": 58.5,
#                 "belt_rank": "1DAN",
#                 "club": "Eagle Martial Arts",
#                 "country": "Australia"
#             }
#         ]

#         # Create participants and assign to appropriate events
#         created_participants = []
#         events = Event.objects.filter(tournament=tournament)
        
#         for data in participants_data:
#             participant = Participant.objects.create(
#                 tournament=tournament,
#                 **data
#             )
            
#             # Find suitable events for the participant
#             suitable_events = events.filter(
#                 gender=data['gender'],
#                 age_category=participant.age_category
#             )
            
#             # For Kumite events, match by weight category
#             for event in suitable_events:
#                 if 'KUMITE' in event.category:
#                     weight = data['weight']
#                     if (event.weight_category.startswith('-') and 
#                         weight <= float(event.weight_category[1:-2])):
#                         participant.events.add(event)
#                     elif (event.weight_category.startswith('+') and 
#                           weight > float(event.weight_category[1:-2])):
#                         participant.events.add(event)
#                 else:  # Kata events
#                     participant.events.add(event)
            
#             created_participants.append(participant)

#         serializer = ParticipantDetailSerializer(created_participants, many=True)
#         return Response(serializer.data)

#     @action(detail=True, methods=['post'])
#     def generate_events(self, request, pk=None):
#         tournament = self.get_object()
        
#         # Generate events for all categories
#         categories = ['KATA_INDIVIDUAL', 'KATA_TEAM', 
#                      'KUMITE_INDIVIDUAL', 'KUMITE_TEAM']
#         age_categories = ['CADET', 'JUNIOR', 'SENIOR']
#         genders = ['M', 'F']
        
#         events_created = []
        
#         for category in categories:
#             for age in age_categories:
#                 for gender in genders:
#                     if 'KUMITE' in category:
#                         weight_cats = Event.WEIGHT_CATEGORIES_MALE if gender == 'M' \
#                                     else Event.WEIGHT_CATEGORIES_FEMALE
#                         for weight in weight_cats:
#                             event = Event.objects.create(
#                                 tournament=tournament,
#                                 category=category,
#                                 age_category=age,
#                                 gender=gender,
#                                 weight_category=weight[0]
#                             )
#                             events_created.append(event)
#                     else:
#                         event = Event.objects.create(
#                             tournament=tournament,
#                             category=category,
#                             age_category=age,
#                             gender=gender
#                         )
#                         events_created.append(event)
        
#         serializer = EventSerializer(events_created, many=True)
#         return Response(serializer.data)

# class EventViewSet(viewsets.ModelViewSet):
#     queryset = Event.objects.all()
#     serializer_class = EventSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         queryset = Event.objects.all()
#         tournament_id = self.request.query_params.get('tournament', None)
#         if tournament_id:
#             queryset = queryset.filter(tournament_id=tournament_id)
#         return queryset

#     @action(detail=True)
#     def brackets(self, request, pk=None):
#         event = self.get_object()
#         serializer = BracketSerializer(event)
#         return Response(serializer.data)


#     @action(detail=True, methods=['post'])
#     def generate_brackets(self, request, pk=None):
#         event = self.get_object()
#         participants = list(event.participants.all())
        
#         if len(participants) < 2:
#             return Response(
#                 {'error': 'Need at least 2 participants to generate brackets'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         with transaction.atomic():
#             Match.objects.filter(event=event).delete()
        
#             # Calculate proper bracket size (next power of 2)
#             num_participants = len(participants)
#             bracket_size = 1 << (num_participants - 1).bit_length()
#             num_rounds = int(math.log2(bracket_size))
            
#             # Seed participants with byes
#             seeded = participants + [None] * (bracket_size - num_participants)
            
#             # Create matches for each round
#             matches_by_round = []

#             # Create all rounds with pre-seeded participants
#             for r in range(1, num_rounds + 1):
#                 current_round = []
#                 matches_in_round = bracket_size // (2 ** r)
#                 for i in range(0, matches_in_round):
#                     idx1 = i * 2 ** (r - 1)
#                     idx2 = idx1 + 2 ** (r - 1)
#                     match = Match.objects.create(
#                         event=event,
#                         round_number=r,
#                         match_number=i + 1,
#                         competitor1=seeded[idx1] if idx1 < len(seeded) else None,
#                         competitor2=seeded[idx2] if idx2 < len(seeded) else None
#                     )
#                     current_round.append(match)
#                     matches_by_round.append(current_round)

#             event.status = 'IN_PROGRESS'
#             event.save()
        
#         matches = Match.objects.filter(event=event).order_by('round_number', 'match_number')
#         return Response(MatchSerializer(matches, many=True).data)




# class ParticipantViewSet(viewsets.ModelViewSet):
#     queryset = Participant.objects.all()
#     permission_classes = [IsAuthenticated]

#     def get_serializer_class(self):
#         if self.action == 'list':
#             return ParticipantListSerializer
#         return ParticipantDetailSerializer

#     def get_queryset(self):
#         queryset = Participant.objects.all()
#         tournament_id = self.request.query_params.get('tournament', None)
#         if tournament_id:
#             queryset = queryset.filter(tournament_id=tournament_id)
#         return queryset

#     def create(self, request, *args, **kwargs):
#         print('Received data:', request.data)  # Debug log
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         participant = serializer.save()
#         event_ids = request.data.get('events', [])
#         participant.events.set(event_ids)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    
# class MatchViewSet(viewsets.ModelViewSet):
#     queryset = Match.objects.all()
#     serializer_class = MatchSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         queryset = Match.objects.all()
#         event_id = self.request.query_params.get('event', None)
#         if event_id:
#             queryset = queryset.filter(event_id=event_id)
#         return queryset.order_by('round_number', 'match_number')

#     def _advance_winner(self, match):
#         """Helper method to advance winner to next round"""
#         next_round = match.round_number + 1
#         next_match_number = (match.match_number + 1) // 2
#         try:
#             next_match = Match.objects.get(
#                 event=match.event,
#                 round_number=next_round,
#                 match_number=next_match_number
#             )
            
#             # Determine if this winner goes to competitor1 or competitor2 slot
#             if match.match_number % 2 == 1:
#                 next_match.competitor1 = match.winner
#             else:
#                 next_match.competitor2 = match.winner
                
#             next_match.save()
            
#             # If both competitors are set and one was a bye, auto-complete the match
#             if (next_match.competitor1 and next_match.competitor2 and 
#                 not next_match.competitor2):
#                 next_match.winner = next_match.competitor1
#                 next_match.status = 'COMPLETED'
#                 next_match.save()
#                 self._advance_winner(next_match)
                
#         except Match.DoesNotExist:
#             # This was the final match
#             match.event.status = 'COMPLETED'
#             match.event.save()

#     def update(self, request, *args, **kwargs):
#         match = self.get_object()
#         response = super().update(request, *args, **kwargs)
        
#         # If match is completed and has a winner, advance to next round
#         if match.status == 'COMPLETED' and match.winner:
#             self._advance_winner(match)
        
#         return response

#     @action(detail=True, methods=['post'])
#     def record_result(self, request, pk=None):
#         match = self.get_object()
#         winner_id = request.data.get('winner')
#         score1 = request.data.get('score1')
#         score2 = request.data.get('score2')
        
#         if not winner_id:
#             return Response(
#                 {'error': 'Winner must be specified'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
#         winner = get_object_or_404(Participant, id=winner_id)
#         if winner not in [match.competitor1, match.competitor2]:
#             return Response(
#                 {'error': 'Winner must be one of the competitors'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
#         match.winner = winner
#         match.score1 = score1
#         match.score2 = score2
#         match.status = 'COMPLETED'
#         match.save()
        
#         # Advance winner to next round
#         self._advance_winner(match)
        
#         return Response(MatchSerializer(match).data)


import math
import random

from django.contrib.auth import authenticate
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Event, Match, Participant, Tournament, Bracket
from .serializers import (BracketSerializer, EventSerializer, MatchSerializer,
                          ParticipantDetailSerializer,
                          ParticipantListSerializer, TournamentSerializer)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response({'error': 'Please provide both username and password'}, 
                        status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    return Response({'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED)

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def add_sample_participants(self, request, pk=None):
        tournament = self.get_object()
        from datetime import date
        participants_data = [
            {
                "first_name": "John", "last_name": "Smith",
                "date_of_birth": date(2005, 5, 15), "gender": "M",
                "weight": 65.5, "belt_rank": "1DAN",
                "club": "Dragon Dojo", "country": "USA"
            },
            {
                "first_name": "Emma", "last_name": "Johnson",
                "date_of_birth": date(2006, 3, 20), "gender": "F",
                "weight": 55.0, "belt_rank": "1DAN",
                "club": "Tiger Academy", "country": "UK"
            },
            {
                "first_name": "Michael", "last_name": "Chen",
                "date_of_birth": date(2005, 8, 10), "gender": "M",
                "weight": 70.2, "belt_rank": "2DAN",
                "club": "Phoenix Karate", "country": "Canada"
            },
            {
                "first_name": "Sarah", "last_name": "Williams",
                "date_of_birth": date(2006, 1, 5), "gender": "F",
                "weight": 58.5, "belt_rank": "1DAN",
                "club": "Eagle Martial Arts", "country": "Australia"
            }
        ]
        created_participants = []
        events = Event.objects.filter(tournament=tournament)
        for data in participants_data:
            participant = Participant.objects.create(tournament=tournament, **data)
            suitable_events = events.filter(gender=data['gender'], age_category=participant.age_category)
            for event in suitable_events:
                if 'KUMITE' in event.category:
                    weight = data['weight']
                    if (event.weight_category.startswith('-') and 
                        weight <= float(event.weight_category[1:-2])):
                        participant.events.add(event)
                    elif (event.weight_category.startswith('+') and 
                          weight > float(event.weight_category[1:-2])):
                        participant.events.add(event)
                else:
                    participant.events.add(event)
            created_participants.append(participant)
        serializer = ParticipantDetailSerializer(created_participants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def generate_events(self, request, pk=None):
        tournament = self.get_object()
        categories = ['KATA_INDIVIDUAL', 'KATA_TEAM', 'KUMITE_INDIVIDUAL', 'KUMITE_TEAM']
        age_categories = ['CADET', 'JUNIOR', 'SENIOR']
        genders = ['M', 'F']
        events_created = []
        for category in categories:
            for age in age_categories:
                for gender in genders:
                    if 'KUMITE' in category:
                        weight_cats = Event.WEIGHT_CATEGORIES_MALE if gender == 'M' else Event.WEIGHT_CATEGORIES_FEMALE
                        for weight in weight_cats:
                            event = Event.objects.create(
                                tournament=tournament, category=category,
                                age_category=age, gender=gender, weight_category=weight[0]
                            )
                            events_created.append(event)
                    else:
                        event = Event.objects.create(
                            tournament=tournament, category=category,
                            age_category=age, gender=gender
                        )
                        events_created.append(event)
        serializer = EventSerializer(events_created, many=True)
        return Response(serializer.data)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Event.objects.all()
        tournament_id = self.request.query_params.get('tournament', None)
        if tournament_id:
            queryset = queryset.filter(tournament_id=tournament_id)
        return queryset

    @action(detail=True)
    def brackets(self, request, pk=None):
        event = self.get_object()
        serializer = BracketSerializer(event)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def generate_brackets(self, request, pk=None):
        """
        Simplified bracket generation - creates one bracket per event
        with all participants from that event.
        """
        event = self.get_object()
        participants = list(event.participants.all())
        
        if len(participants) < 2:
            return Response(
                {'error': 'Need at least 2 participants to generate brackets'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create a single bracket for this event
        with transaction.atomic():
            # Delete any existing brackets for this event
            event.brackets.all().delete()
            
            # Create a new bracket
            bracket = Bracket.objects.create(
                event=event,
                name=f"{event.get_category_display()} Bracket",
                max_participants=len(participants)
            )
            
            # Generate matches directly
            num_participants = len(participants)
            bracket_size = min(32, 1 << (num_participants - 1).bit_length())
            num_rounds = int(math.log2(bracket_size))
            
            # Randomize participants and fill the bracket
            random.shuffle(participants)
            seeded = participants + [None] * (bracket_size - num_participants)
            
            # Create first round matches
            matches = []
            for i in range(0, bracket_size, 2):
                match = Match.objects.create(
                    event=event,
                    round_number=1,
                    match_number=(i // 2) + 1,
                    competitor1=seeded[i],
                    competitor2=seeded[i + 1] if i + 1 < len(seeded) else None
                )
                matches.append(match)
                
            # Create subsequent round placeholders
            current_matches = matches
            for r in range(2, num_rounds + 1):
                next_matches = []
                for j in range(0, len(current_matches), 2):
                    match = Match.objects.create(
                        event=event,
                        round_number=r,
                        match_number=(j // 2) + 1,
                        competitor1=None,
                        competitor2=None
                    )
                    next_matches.append(match)
                current_matches = next_matches
                matches.extend(next_matches)
                
            # Update event status
            event.status = 'IN_PROGRESS'
            event.save()
            
            # Update bracket status
            bracket.status = 'IN_PROGRESS'
            bracket.save()
            
        # Return all matches
        all_matches = Match.objects.filter(event=event).order_by('round_number', 'match_number')
        return Response({
            'message': 'Bracket created successfully',
            'bracket': BracketSerializer(bracket).data,
            'matches': MatchSerializer(all_matches, many=True).data
        })

class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ParticipantListSerializer
        return ParticipantDetailSerializer

    def get_queryset(self):
        queryset = Participant.objects.all()
        tournament_id = self.request.query_params.get('tournament', None)
        event_id = self.request.query_params.get('event', None)
        if tournament_id:
            queryset = queryset.filter(tournament_id=tournament_id)
        if event_id:
            # Filter participants who have this event in their many-to-many relationship
            queryset = queryset.filter(events__id=event_id)
            
        return queryset.distinct()  # Use distinct() to avoid duplicates in M2M relationships
    

        

    def create(self, request, *args, **kwargs):
        print('Received data:', request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        participant = serializer.save()
        event_ids = request.data.get('events', [])
        participant.events.set(event_ids)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Match.objects.all()
        event_id = self.request.query_params.get('event', None)
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        return queryset.order_by('round_number', 'match_number')

class BracketViewSet(viewsets.ModelViewSet):
    queryset = Bracket.objects.all()
    serializer_class = BracketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Bracket.objects.all()
        event_id = self.request.query_params.get('event', None)
        if event_id is not None:
            queryset = queryset.filter(event_id=event_id)
        return queryset

    @action(detail=True, methods=['post'])
    def generate_matches(self, request, pk=None):
        bracket = self.get_object()
        bracket.generate_matches()
        return Response({'status': 'matches generated'})