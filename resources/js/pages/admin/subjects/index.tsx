import { Link, useForm } from '@inertiajs/react'

type Subject = {
    id: number
    code: string
    name: string
    created_at: string | null
    updated_at: string | null
}

type Props = {
    subjects: {
        data: Subject[]
        current_page: number
        last_page: number
        prev_page_url: string | null
        next_page_url: string | null
    }
}

export default function AdminSubjectsIndex({ subjects }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
    })

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        post('/admin/subjects', {
            onSuccess: () => reset(),
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
                    <p className="mt-2 text-gray-600">Create and manage academic subjects for CBT.</p>
                </div>
                <Link
                    href="/admin/dashboard"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                    Back to Dashboard
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Create Subject</h2>
                    <p className="mt-1 text-sm text-gray-600">Add a new subject with a unique code.</p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Subject Code
                            </label>
                            <input
                                id="code"
                                name="code"
                                value={data.code}
                                onChange={(event) => setData('code', event.target.value)}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="MTK"
                            />
                            {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Subject Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Mathematics"
                            />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                        >
                            {processing ? 'Saving...' : 'Save Subject'}
                        </button>
                    </form>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Existing Subjects</h2>
                    <p className="mt-1 text-sm text-gray-600">Edit or delete subjects as needed.</p>

                    <div className="mt-6 space-y-3">
                        {subjects.data.length === 0 ? (
                            <p className="text-sm text-gray-500">No subjects created yet.</p>
                        ) : (
                            subjects.data.map((subject) => (
                                <div key={subject.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium text-gray-900">{subject.name}</p>
                                        <p className="text-sm text-gray-600">Code: {subject.code}</p>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <Link href={`/admin/subjects/${subject.id}/edit`} className="text-blue-600 hover:text-blue-800">
                                            Edit
                                        </Link>
                                        <Link
                                            href={`/admin/subjects/${subject.id}`}
                                            method="delete"
                                            as="button"
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Page {subjects.current_page} of {subjects.last_page}
                        </span>
                        <div className="flex gap-3">
                            {subjects.prev_page_url && (
                                <Link href={subjects.prev_page_url} className="text-blue-600 hover:text-blue-800">
                                    Previous
                                </Link>
                            )}
                            {subjects.next_page_url && (
                                <Link href={subjects.next_page_url} className="text-blue-600 hover:text-blue-800">
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}