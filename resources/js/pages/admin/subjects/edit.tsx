import { Link, useForm } from '@inertiajs/react'

type Subject = {
    id: number
    code: string
    name: string
}

type Props = {
    subject: Subject
}

export default function AdminSubjectEdit({ subject }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: subject.code,
        name: subject.name,
    })

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        put(`/admin/subjects/${subject.id}`)
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Subject</h1>
                    <p className="mt-2 text-gray-600">Update subject code and name.</p>
                </div>
                <Link
                    href="/admin/subjects"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                    Back
                </Link>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>

                        <Link
                            href="/admin/subjects"
                            className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 transition hover:bg-gray-300"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}