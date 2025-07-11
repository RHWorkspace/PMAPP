import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { Tree, TreeNode } from 'react-organizational-chart';

// Fungsi rekursif untuk membangun tree division
function renderDivisionTree(divisions, parentId = null) {
    return divisions
        .filter(d => String(d.parent_id || '') === String(parentId || ''))
        .map(d => (
            <TreeNode
                key={d.id}
                label={<span className="px-2 py-1 bg-purple-100 rounded text-purple-700 font-semibold">{d.title}</span>}
            >
                {renderDivisionTree(divisions, d.id)}
            </TreeNode>
        ));
}

export default function Index() {
    const { divisions, flash } = usePage().props;

    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editParentId, setEditParentId] = useState('');

    useEffect(() => {
        if (flash && flash.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: flash.success,
                timer: 2000,
                showConfirmButton: false,
            });
        }
        if (flash && flash.error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: flash.error,
            });
        }
    }, [flash]);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Yakin hapus division ini?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('divisions.destroy', id));
            }
        });
    };

    const startEdit = (division) => {
        setEditId(division.id);
        setEditTitle(division.title);
        setEditDescription(division.description || '');
        setEditParentId(division.parent_id || '');
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditTitle('');
        setEditDescription('');
        setEditParentId('');
    };

    const submitEdit = (division) => {
        router.put(route('divisions.update', division.id), {
            title: editTitle,
            description: editDescription,
            parent_id: editParentId || null,
        }, {
            onSuccess: () => {
                setEditId(null);
                setEditTitle('');
                setEditDescription('');
                setEditParentId('');
            }
        });
    };

    // Untuk dropdown parent division, exclude diri sendiri
    const parentOptions = (currentId) =>
        divisions.filter(d => d.id !== currentId);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Division</h2>}
        >
            <Head title="Divisions" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">Divisions</h3>
                                <Link
                                    href={route('divisions.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Tambah Division
                                </Link>
                            </div>
                            {/* Chart Organisasi */}
                            <div className="mb-8 overflow-auto">
                                <Tree
                                    lineWidth={'2px'}
                                    lineColor={'#a78bfa'}
                                    lineBorderRadius={'8px'}
                                    label={<span className="px-2 py-1 bg-blue-200 rounded font-bold">N</span>}
                                >
                                    {renderDivisionTree(divisions)}
                                </Tree>
                            </div>
                            {/* Tabel Division */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Deskripsi</th>
                                            <th className="px-4 py-2 text-left">Parent</th>
                                            <th className="px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {divisions.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4">Tidak ada data division.</td>
                                            </tr>
                                        )}
                                        {divisions.map((division, idx) => (
                                            <tr key={division.id} className="border-b">
                                                <td className="px-4 py-2">{idx + 1}</td>
                                                <td className="px-4 py-2">
                                                    {editId === division.id ? (
                                                        <input
                                                            type="text"
                                                            className="border rounded px-2 py-1 w-full"
                                                            value={editTitle}
                                                            onChange={e => setEditTitle(e.target.value)}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-blue-900">{division.title}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {editId === division.id ? (
                                                        <input
                                                            type="text"
                                                            className="border rounded px-2 py-1 w-full"
                                                            value={editDescription}
                                                            onChange={e => setEditDescription(e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{division.description || '-'}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {editId === division.id ? (
                                                        <select
                                                            className="border rounded px-2 py-1 w-full"
                                                            value={editParentId}
                                                            onChange={e => setEditParentId(e.target.value)}
                                                        >
                                                            <option value="">Tidak ada</option>
                                                            {parentOptions(division.id).map((parent) => (
                                                                <option key={parent.id} value={parent.id}>
                                                                    {parent.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span>{division.parent ? division.parent.title : '-'}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 space-x-2">
                                                    {editId === division.id ? (
                                                        <>
                                                            {/* Icon only saat edit */}
                                                            <button
                                                                type="button"
                                                                className="text-green-600 hover:underline"
                                                                onClick={() => submitEdit(division)}
                                                                title="Simpan"
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="text-gray-500 hover:underline"
                                                                onClick={cancelEdit}
                                                                title="Batal"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Icon only saat normal */}
                                                            <button
                                                                type="button"
                                                                className="text-blue-600 hover:underline"
                                                                onClick={() => startEdit(division)}
                                                                title="Edit"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(division.id)}
                                                                className="text-red-600 hover:underline"
                                                                title="Hapus"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}