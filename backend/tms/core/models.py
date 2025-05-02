import math
import random

from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class Tournament(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled')
    ]

    name = models.CharField(max_length=100)
    date = models.DateField()
    venue = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    created_by = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.date})"

class Event(models.Model):
    CATEGORY_CHOICES = [
        ('KATA_INDIVIDUAL', 'Individual Kata'),
        ('KATA_TEAM', 'Team Kata'),
        ('KUMITE_INDIVIDUAL', 'Individual Kumite'),
        ('KUMITE_TEAM', 'Team Kumite')
    ]

    AGE_CATEGORIES = [
        ('CADET', '14-15 years'),
        ('JUNIOR', '16-17 years'),
        ('U21','18-20 years'),
        ('SENIOR', '18+ years')
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed')
    ]
    
    # WKF Weight Categories
    WEIGHT_CATEGORIES_MALE = [
        ('-55KG', 'Under 55kg'),
        ('-60KG', 'Under 60kg'),
        ('-67KG', 'Under 67kg'),
        ('-75KG', 'Under 75kg'),
        ('-84KG', 'Under 84kg'),
        ('+84KG', 'Over 84kg')
    ]
    
    WEIGHT_CATEGORIES_FEMALE = [
        ('-50KG', 'Under 50kg'),
        ('-55KG', 'Under 55kg'),
        ('-61KG', 'Under 61kg'),
        ('-68KG', 'Under 68kg'),
        ('+68KG', 'Over 68kg')
    ]

    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    age_category = models.CharField(max_length=10, choices=AGE_CATEGORIES)
    gender = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female')])
    weight_category = models.CharField(
        max_length=10, 
        choices=WEIGHT_CATEGORIES_MALE + WEIGHT_CATEGORIES_FEMALE,
        null=True, 
        blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    class Meta:
        unique_together = ['tournament', 'category', 'age_category', 'gender', 'weight_category']

    def __str__(self):
        base = f"{self.get_category_display()} - {self.get_age_category_display()} {self.get_gender_display()}"
        if self.weight_category:
            base += f" {self.weight_category}"
        return base

class Participant(models.Model):
    BELT_RANKS = [
        ('9KYU', '9th Kyu - White Belt'),
        ('8KYU', '8th Kyu - Yellow Belt'),
        ('7KYU', '7th Kyu - Orange Belt'),
        ('6KYU', '6th Kyu - Green Belt'),
        ('5KYU', '5th Kyu - Blue Belt'),
        ('4KYU', '4th Kyu - Purple Belt'),
        ('3KYU', '3rd Kyu - Brown Belt'),
        ('2KYU', '2nd Kyu - Brown Belt'),
        ('1KYU', '1st Kyu - Brown Belt'),
        ('1DAN', '1st Dan - Black Belt'),
        ('2DAN', '2nd Dan - Black Belt'),
        ('3DAN', '3rd Dan - Black Belt'),
        ('4DAN', '4th Dan - Black Belt'),
        ('5DAN', '5th Dan - Black Belt'),
    ]

    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female')])
    weight = models.FloatField(validators=[MinValueValidator(0.0)])
    belt_rank = models.CharField(max_length=5, choices=BELT_RANKS)
    club = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    events = models.ManyToManyField(Event, related_name='participants')
    is_team_event = models.BooleanField(default=False)
    team_name = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < 
            (self.date_of_birth.month, self.date_of_birth.day)
        )

    @property
    def age_category(self):
        age = self.age
        if age <= 15:
            return 'CADET'
        elif age <= 17:
            return 'JUNIOR'
        return 'SENIOR'

    def __str__(self):
        if self.is_team_event:
            return f"{self.team_name} ({self.club})"
        return f"{self.full_name} ({self.club})"

class Match(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed')
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    round_number = models.PositiveIntegerField()
    match_number = models.PositiveIntegerField()
    competitor1 = models.ForeignKey(
        Participant, 
        related_name='matches_as_competitor1',
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    competitor2 = models.ForeignKey(
        Participant,
        related_name='matches_as_competitor2',
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    winner = models.ForeignKey(
        Participant,
        related_name='matches_won',
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    score1 = models.PositiveIntegerField(null=True, blank=True)
    score2 = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['event', 'round_number', 'match_number']
        ordering = ['round_number', 'match_number']

    def __str__(self):
        return f"Match {self.match_number} (Round {self.round_number}) - {self.event}"

class Bracket(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='brackets')
    name = models.CharField(max_length=100)
    max_participants = models.PositiveIntegerField(default=10)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('IN_PROGRESS', 'In Progress'),
            ('COMPLETED', 'Completed')
        ],
        default='PENDING'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['event', 'name']
        ordering = ['created_at']

    def __str__(self):
        return f"{self.name} - {self.event}"

    def generate_matches(self):
        # Get all participants for this bracket
        participants = list(self.event.participants.all())
        
        if not participants:
            raise ValueError("No participants found for this event")
            
        if len(participants) < 2:
            raise ValueError("Need at least 2 participants to generate matches")
        
        # Clear existing matches for this bracket only
        Match.objects.filter(bracket=self).delete()
        
        # Calculate number of rounds needed (next power of 2)
        num_participants = len(participants)
        bracket_size = 1
        while bracket_size < num_participants:
            bracket_size *= 2
            
        num_rounds = int(math.log2(bracket_size))
        
        # Create matches for each round
        matches = []
        for round_num in range(1, num_rounds + 1):
            num_matches = bracket_size // (2 ** round_num)
            for match_num in range(1, num_matches + 1):
                match = Match.objects.create(
                    event=self.event,
                    bracket=self,
                    round_number=round_num,
                    match_number=match_num,
                    status='PENDING'
                )
                matches.append(match)
                
        # Assign participants to first round matches
        first_round_matches = [m for m in matches if m.round_number == 1]
        num_first_round_matches = len(first_round_matches)
        
        # Shuffle participants to randomize matchups
        random.shuffle(participants)
        
        # Assign participants to matches
        for i, participant in enumerate(participants):
            if i < num_first_round_matches:
                match = first_round_matches[i]
                if i % 2 == 0:
                    match.competitor1 = participant
                else:
                    match.competitor2 = participant
                match.save()
                
        self.status = 'IN_PROGRESS'
        self.save()
        
        return matches
