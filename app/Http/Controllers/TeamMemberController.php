<?php

namespace App\Http\Controllers;

use App\Models\TeamMember;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamMemberController extends Controller
{
    // Tampilkan daftar anggota tim
    public function index($teamId)
    {
        $team = Team::with(['members.user'])->findOrFail($teamId);
        $users = User::select('id', 'name')->get();

        return Inertia::render('Teams/Members/Index', [
            'team' => $team,
            'users' => $users,
        ]);
    }

    // Tambah anggota tim
    public function store(Request $request, $teamId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:Admin,Member,Viewer',
            'status' => 'required|in:Dedicated,Not',
        ]);

        TeamMember::create([
            'team_id' => $teamId,
            'user_id' => $request->user_id,
            'role' => $request->role,
            'status' => $request->status,
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Anggota tim berhasil ditambahkan.');
    }

    // Update anggota tim
    public function update(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:Admin,Member,Viewer',
            'status' => 'required|in:Dedicated,Not',
        ]);

        $member = TeamMember::findOrFail($id);
        $member->update([
            'role' => $request->role,
            'status' => $request->status,
        ]);

        return redirect()->back()->with('success', 'Data anggota tim berhasil diupdate.');
    }

    // Hapus anggota tim
    public function destroy($id)
    {
        $member = TeamMember::findOrFail($id);
        $member->delete();

        return redirect()->back()->with('success', 'Anggota tim berhasil dihapus.');
    }

    // Tampilkan detail tim
    public function show($id)
    {
        $team = Team::with([
            'division',
            'creator',
            'members.user'
        ])->findOrFail($id);

        // Cari leader: role Admin dan position PM
        $leader = $team->members
            ->filter(function($member) {
                return $member->role === 'Admin' && $member->user && $member->user->position === 'PM';
            })
            ->first();

        return Inertia::render('Teams/Show', [
            'team' => [
                ...$team->toArray(),
                'leader' => $leader ? [
                    'name' => $leader->user ? $leader->user->name : '-',
                ] : null,
                'members' => $team->members->map(function($member) {
                    return [
                        'id' => $member->id,
                        'user' => $member->user ? [
                            'name' => $member->user->name,
                            'position' => $member->user->position ?? null,
                        ] : null,
                        'role' => $member->role,
                        'position' => $member->position ?? null,
                    ];
                }),
            ]
        ]);
    }
}
