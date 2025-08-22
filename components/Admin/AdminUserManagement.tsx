

import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { PlusIcon, PencilIcon, TrashIcon } from '../Icons.tsx';

const AdminUserManagement: React.FC = () => {
    const { adminUsers, deleteAdminUser, loggedInUser, showConfirmation } = useAppContext();

    const handleDelete = (userId: string, userName: string) => {
        showConfirmation(
            `Are you sure you want to delete user "${userName}"? This cannot be undone.`,
            () => deleteAdminUser(userId)
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Manage Admin Users</h3>
                <Link to="/admin/user/new" className="btn btn-primary">
                    <PlusIcon className="h-4 w-4" />
                    <span>Add New User</span>
                </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Only the main admin can create, edit, or delete other admin users.</p>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Tel</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {adminUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.tel}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {user.isMainAdmin ? 
                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Main Admin</span> : 
                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Admin</span>
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link to={`/admin/user/edit/${user.id}`} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Edit User">
                                            <PencilIcon className="h-4 w-4" />
                                        </Link>
                                        {!user.isMainAdmin && user.id !== loggedInUser?.id && (
                                            <button onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Delete User">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUserManagement;