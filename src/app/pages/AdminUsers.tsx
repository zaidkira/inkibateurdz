import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Search,
  UserCheck,
  UserX,
  Filter,
  Plus
} from 'lucide-react';
import { User } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isMentorDialogOpen, setIsMentorDialogOpen] = useState(false);
  const [mentorData, setMentorData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    staffId: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, filterStatus, users]);

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    // Exclude admin from the list
    const nonAdminUsers = allUsers.filter((u: User) => u.role !== 'admin');
    setUsers(nonAdminUsers);
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(u => 
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    // Status filter
    if (filterStatus === 'pending') {
      filtered = filtered.filter(u => !u.approved);
    } else if (filterStatus === 'approved') {
      filtered = filtered.filter(u => u.approved);
    }

    setFilteredUsers(filtered);
  };

  const handleApprove = (userId: string) => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.map((u: User) => 
      u.id === userId ? { ...u, approved: true } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadUsers();
    toast.success('Utilisateur approuvé avec succès');
  };

  const handleReject = (userId: string) => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.filter((u: User) => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadUsers();
    toast.success('Utilisateur rejeté');
  };

  const handleDeactivate = (userId: string) => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.map((u: User) => 
      u.id === userId ? { ...u, approved: false } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadUsers();
    toast.success('Compte désactivé');
  };

  const handleCreateMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (mentorData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (allUsers.some((u: User) => u.email === mentorData.email)) {
      toast.error('Cet email est déjà utilisé');
      return;
    }

    const newMentorId = `mentor-${Date.now()}`;
    const newMentor: User = {
      id: newMentorId,\n      role: 'mentor',
      firstName: mentorData.firstName,
      lastName: mentorData.lastName,
      email: mentorData.email,
      department: mentorData.department,
      staffId: mentorData.staffId,
      approved: true // Mentors created by admin are automatically approved
    } as User;\n\n    allUsers.push(newMentor);
    localStorage.setItem('users', JSON.stringify(allUsers));

    const passwords = JSON.parse(localStorage.getItem('passwords') || '[]');
    passwords.push({ userId: newMentorId, password: mentorData.password });
    localStorage.setItem('passwords', JSON.stringify(passwords));
    
    setIsMentorDialogOpen(false);
    setMentorData({ firstName: '', lastName: '', email: '', password: '', department: '', staffId: '' });
    loadUsers();
    toast.success('Compte mentor créé avec succès');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {\n      case 'student': return 'bg-blue-100 text-blue-700';\n      case 'mentor': return 'bg-purple-100 text-purple-700';\n      default: return 'bg-gray-100 text-gray-700';\n    }\n  };\n\n  const getRoleLabel = (role: string) => {\n    switch (role) {\n      case 'student': return 'Étudiant';\n      case 'mentor': return 'Mentor';\n      default: return role;\n    }\n  };\n\n  const pendingCount = users.filter(u => !u.approved).length;\n  const approvedCount = users.filter(u => u.approved).length;\n\n  return (\n    <div>\n      <div className=\"space-y-6\">\n        <div className=\"flex items-center justify-between\">\n          <div>\n            <h1 className=\"text-2xl font-bold text-gray-900 mb-2\">Gestion des utilisateurs</h1>\n            <p className=\"text-gray-600\">Approuvez, rejetez ou désactivez les comptes utilisateurs</p>\n          </div>\n          <Dialog open={isMentorDialogOpen} onOpenChange={setIsMentorDialogOpen}>\n            <DialogTrigger asChild>\n              <Button className=\"bg-purple-600 hover:bg-purple-700\">\n                <Plus className=\"w-4 h-4 mr-2\" />\n                Créer compte Mentor\n              </Button>\n            </DialogTrigger>\n            <DialogContent className=\"max-w-md\">\n              <DialogHeader>\n                <DialogTitle>Ajouter un nouveau Mentor</DialogTitle>\n              </DialogHeader>\n              <form onSubmit={handleCreateMentor} className=\"space-y-4 mt-4\">\n                <div className=\"grid grid-cols-2 gap-4\">\n                  <div className=\"space-y-2\">\n                    <Label>Prénom</Label>\n                    <Input value={mentorData.firstName} onChange={e => setMentorData({...mentorData, firstName: e.target.value})} required />\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label>Nom</Label>\n                    <Input value={mentorData.lastName} onChange={e => setMentorData({...mentorData, lastName: e.target.value})} required />\n                  </div>\n                </div>\n                <div className=\"space-y-2\">\n                  <Label>Email</Label>\n                  <Input type=\"email\" value={mentorData.email} onChange={e => setMentorData({...mentorData, email: e.target.value})} required />\n                </div>\n                <div className=\"space-y-2\">\n                  <Label>Mot de passe</Label>\n                  <Input type=\"password\" value={mentorData.password} onChange={e => setMentorData({...mentorData, password: e.target.value})} minLength={6} required />\n                </div>\n                <div className=\"grid grid-cols-2 gap-4\">\n                  <div className=\"space-y-2\">\n                    <Label>Département / Spécialité</Label>\n                    <Input value={mentorData.department} onChange={e => setMentorData({...mentorData, department: e.target.value})} required />\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label>ID Personnel</Label>\n                    <Input value={mentorData.staffId} onChange={e => setMentorData({...mentorData, staffId: e.target.value})} required />\n                  </div>\n                </div>\n                <Button type=\"submit\" className=\"w-full bg-purple-600 hover:bg-purple-700\">Créer le compte</Button>\n              </form>\n            </DialogContent>\n          </Dialog>\n        </div>\n\n        {/* Stats */}\n        <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">\n          <Card className=\"border-0 shadow-sm\">\n            <CardContent className=\"p-6\">\n              <div className=\"flex items-center justify-between\">\n                <div>\n                  <p className=\"text-sm text-gray-600 mb-1\">Total utilisateurs</p>\n                  <p className=\"text-3xl font-bold text-gray-900\">{users.length}</p>\n                </div>\n                <div className=\"w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center\">\n                  <Users className=\"w-6 h-6 text-blue-600\" />\n                </div>\n              </div>\n            </CardContent>\n          </Card>\n\n          <Card className=\"border-0 shadow-sm\">\n            <CardContent className=\"p-6\">\n              <div className=\"flex items-center justify-between\">\n                <div>\n                  <p className=\"text-sm text-gray-600 mb-1\">En attente</p>\n                  <p className=\"text-3xl font-bold text-orange-600\">{pendingCount}</p>\n                </div>\n                <div className=\"w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center\">\n                  <UserCheck className=\"w-6 h-6 text-orange-600\" />\n                </div>\n              </div>\n            </CardContent>\n          </Card>\n\n          <Card className=\"border-0 shadow-sm\">\n            <CardContent className=\"p-6\">\n              <div className=\"flex items-center justify-between\">\n                <div>\n                  <p className=\"text-sm text-gray-600 mb-1\">Approuvés</p>\n                  <p className=\"text-3xl font-bold text-green-600\">{approvedCount}</p>\n                </div>\n                <div className=\"w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center\">\n                  <CheckCircle2 className=\"w-6 h-6 text-green-600\" />\n                </div>\n              </div>\n            </CardContent>\n          </Card>\n        </div>\n\n        {/* Filters */}\n        <Card className=\"border-0 shadow-sm\">\n          <CardContent className=\"p-6\">\n            <div className=\"flex flex-col md:flex-row gap-4\">\n              <div className=\"flex-1 relative\">\n                <Search className=\"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400\" />\n                <Input\n                  placeholder=\"Rechercher par nom ou email...\"\n                  value={searchTerm}\n                  onChange={(e) => setSearchTerm(e.target.value)}\n                  className=\"pl-10\"\n                />\n              </div>\n              <Select value={filterRole} onValueChange={setFilterRole}>\n                <SelectTrigger className=\"w-full md:w-[180px]\">\n                  <Filter className=\"w-4 h-4 mr-2\" />\n                  <SelectValue placeholder=\"Rôle\" />\n                </SelectTrigger>\n                <SelectContent>\n                  <SelectItem value=\"all\">Tous les rôles</SelectItem>\n                  <SelectItem value=\"student\">Étudiants</SelectItem>\n                  <SelectItem value=\"mentor\">Mentors</SelectItem>\n                </SelectContent>\n              </Select>\n              <Select value={filterStatus} onValueChange={setFilterStatus}>\n                <SelectTrigger className=\"w-full md:w-[180px]\">\n                  <Filter className=\"w-4 h-4 mr-2\" />\n                  <SelectValue placeholder=\"Statut\" />\n                </SelectTrigger>\n                <SelectContent>\n                  <SelectItem value=\"all\">Tous les statuts</SelectItem>\n                  <SelectItem value=\"pending\">En attente</SelectItem>\n                  <SelectItem value=\"approved\">Approuvés</SelectItem>\n                </SelectContent>\n              </Select>\n            </div>\n          </CardContent>\n        </Card>\n\n        {/* Users List */}\n        <Card className=\"border-0 shadow-sm\">\n          <CardHeader className=\"border-b\">\n            <CardTitle>Liste des utilisateurs</CardTitle>\n          </CardHeader>\n          <CardContent className=\"p-6\">\n            {filteredUsers.length > 0 ? (\n              <div className=\"space-y-4\">\n                {filteredUsers.map((user) => (\n                  <div \n                    key={user.id}\n                    className=\"flex items-center justify-between p-5 rounded-lg border hover:bg-gray-50 transition-colors\"\n                  >\n                    <div className=\"flex items-center space-x-4 flex-1\">\n                      <div className=\"w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold\">\n                        {user.firstName[0]}{user.lastName[0]}\n                      </div>\n                      <div className=\"flex-1\">\n                        <div className=\"flex items-center space-x-3 mb-1\">\n                          <h4 className=\"font-medium text-gray-900\">\n                            {user.firstName} {user.lastName}\n                          </h4>\n                          <Badge className={getRoleBadgeColor(user.role)}>\n                            {getRoleLabel(user.role)}\n                          </Badge>\n                          {!user.approved && (\n                            <Badge className=\"bg-orange-100 text-orange-700\">\n                              En attente\n                            </Badge>\n                          )}\n                        </div>\n                        <div className=\"flex items-center space-x-4 text-sm text-gray-600\">\n                          <span>{user.email}</span>\n                          {user.role === 'student' && user.university && (\n                            <>\n                              <span>\u2022</span>\n                              <span>{user.university}</span>\n                            </>\n                          )}\n                          {user.department && (\n                            <>\n                              <span>\u2022</span>\n                              <span>{user.department}</span>\n                            </>\n                          )}\n                        </div>\n                      </div>\n                    </div>\n                    <div className=\"flex items-center space-x-2\">\n                      {!user.approved ? (\n                        <>\n                          <Button \n                            size=\"sm\" \n                            className=\"bg-green-600 hover:bg-green-700\"\n                            onClick={() => handleApprove(user.id)}\n                          >\n                            <CheckCircle2 className=\"w-4 h-4 mr-1\" />\n                            Approuver\n                          </Button>\n                          <Button \n                            size=\"sm\" \n                            variant=\"destructive\"\n                            onClick={() => handleReject(user.id)}\n                          >\n                            <XCircle className=\"w-4 h-4 mr-1\" />\n                            Rejeter\n                          </Button>\n                        </>\n                      ) : (\n                        <Button \n                          size=\"sm\" \n                          variant=\"outline\"\n                          className=\"text-red-600 border-red-300 hover:bg-red-50\"\n                          onClick={() => handleDeactivate(user.id)}\n                        >\n                          <UserX className=\"w-4 h-4 mr-1\" />\n                          Désactiver\n                        </Button>\n                      )}\n                    </div>\n                  </div>\n                ))}\n              </div>\n            ) : (\n              <div className=\"text-center py-12\">\n                <Users className=\"w-16 h-16 text-gray-300 mx-auto mb-4\" />\n                <h3 className=\"font-medium text-gray-900 mb-2\">Aucun utilisateur trouvé</h3>\n                <p className=\"text-gray-500 text-sm\">\n                  {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Les nouveaux utilisateurs apparaîtront ici'}\n                </p>\n              </div>\n            )}\n          </CardContent>\n        </Card>\n      </div>\n    </div>\n  );\n};\n\nexport default AdminUsers;\n