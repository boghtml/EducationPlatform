# apps/notes/views.py

from rest_framework import generics
from .models import UserNote, NoteFolder
from .serializers import UserNoteSerializer, NoteFolderSerializer
from rest_framework.permissions import IsAuthenticated
from .mixins import CsrfExemptSessionAuthentication

class UserNoteCreateView(generics.CreateAPIView):
    queryset = UserNote.objects.all()
    serializer_class = UserNoteSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserNoteListView(generics.ListAPIView):
    serializer_class = UserNoteSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get_queryset(self):
        return UserNote.objects.filter(user=self.request.user)

class UserNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserNote.objects.all()
    serializer_class = UserNoteSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = (CsrfExemptSessionAuthentication,)

class NoteFolderCreateView(generics.CreateAPIView):
    queryset = NoteFolder.objects.all()
    serializer_class = NoteFolderSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NoteFolderListView(generics.ListAPIView):
    serializer_class = NoteFolderSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get_queryset(self):
        return NoteFolder.objects.filter(user=self.request.user)

class NoteFolderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = NoteFolder.objects.all()
    serializer_class = NoteFolderSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = (CsrfExemptSessionAuthentication,)
