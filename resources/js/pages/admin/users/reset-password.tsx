import { useForm } from '@inertiajs/react'
import { FormEvent } from 'react'

export default function AdminResetPassword({ user }) {
    const { data, setData, post, errors, processing } = useForm({
        password: '',
        password_confirmation: '',
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        post(`/admin/users/${user.id}/reset-password`)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
                <p className="mt-2 text-gray-600">Reset password for {user.name}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 max-w-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Role: {user.role.toUpperCase()}</p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                errors.password ? 'border-red-500' : 'border'
                            }`}
                            placeholder="••••••••"
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                errors.password_confirmation ? 'border-red-500' : 'border'
                            }`}
                            placeholder="••••••••"
                            required
                        />
                        {errors.password_confirmation && (
                            <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium"
                        >
                            {processing ? 'Resetting...' : 'Reset Password'}
                        </button>
                        <a
                            href="/admin/users"
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium text-center"
                        >
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </div>
    )
}
