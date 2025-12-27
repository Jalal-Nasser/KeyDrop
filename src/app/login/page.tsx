'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (res?.error) {
                setError('Invalid credentials. Please try again.')
            } else {
                router.push('/admin')
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[100px]" />
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 transition-all duration-300 hover:shadow-purple-500/20">
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-tr from-purple-500 to-indigo-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
                    <p className="text-indigo-200 mt-2 text-sm">Enter your secure dashboard credentials</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm flex items-center animate-pulse">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Email"
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center group transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                            <>
                                Sign In to Dashboard
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400">
                        Protected by secure encryption
                    </p>
                </div>
            </div>
        </div>
    )
}
