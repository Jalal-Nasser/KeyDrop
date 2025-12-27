'use client'

import { useState, useEffect } from 'react'
import { Save, Building2, CreditCard, Mail, Globe, Hash, FileText, Image as ImageIcon, Lock } from 'lucide-react'
import { getSettings, updateSettings } from '@/app/actions/settings'
import { changePassword } from '@/app/actions/auth'

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    // @ts-ignore
    const [settings, setSettings] = useState<any>({
        storeName: '',
        supportEmail: '',
        currency: 'USD',
        taxRate: 0,
        invoiceFooter: '',
        logoUrl: ''
    })

    useEffect(() => {
        getSettings().then(data => {
            setSettings(data)
            setInitialLoading(false)
        })
    }, [])

    const handleSave = async (formData: FormData) => {
        setLoading(true)
        try {
            await updateSettings(formData)
            // Optimistic update
            const updates = Object.fromEntries(formData.entries())
            setSettings({ ...settings, ...updates })
            alert('Settings saved successfully!')
        } catch (err) {
            console.error(err)
            alert('Failed to save settings.')
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your store configuration and billing preferences.</p>
                </div>
            </div>

            <form action={handleSave} className="space-y-8">
                {/* General Section */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white">General Information</h2>
                            <p className="text-sm text-gray-500">Basic details about your store.</p>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    name="storeName"
                                    type="text"
                                    defaultValue={settings.storeName}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Support Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    name="supportEmail"
                                    type="email"
                                    defaultValue={settings.supportEmail}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    placeholder="support@example.com"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Billing Section */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white">Billing Configuration</h2>
                            <p className="text-sm text-gray-500">Currency and tax settings for invoices.</p>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                            <select
                                name="currency"
                                defaultValue={settings.currency}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tax Rate (%)</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    name="taxRate"
                                    type="number"
                                    step="0.01"
                                    defaultValue={settings.taxRate}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Invoice Branding */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white">Invoice Branding</h2>
                            <p className="text-sm text-gray-500">Customize how your invoices look.</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo URL</label>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <ImageIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        name="logoUrl"
                                        type="text"
                                        defaultValue={settings.logoUrl || ''}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Footer Message</label>
                            <textarea
                                name="invoiceFooter"
                                defaultValue={settings.invoiceFooter || 'Thank you for your business!'}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                                placeholder="Terms and conditions, thank you note, etc."
                            />
                        </div>
                    </div>
                </section>

                <div className="sticky bottom-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg shadow-purple-500/30 flex items-center transition-all transform hover:-translate-y-0.5"
                    >
                        <Save size={20} className="mr-2" />
                        {loading ? 'Saving Changes...' : 'Save Configuration'}
                    </button>
                </div>
            </form>

            {/* Security Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-12">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">Security Settings</h2>
                        <p className="text-sm text-gray-500">Update your account password.</p>
                    </div>
                </div>
                <form action={async (formData) => {
                    setLoading(true)
                    try {
                        const result = await changePassword(formData)
                        if (result.success) {
                            alert('Password changed successfully!')
                            // @ts-ignore
                            document.getElementById('password-form')?.reset()
                        }
                    } catch (err: any) {
                        alert(err.message || 'Failed to change password.')
                    } finally {
                        setLoading(false)
                    }
                }} id="password-form" className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                            <input
                                name="currentPassword"
                                type="password"
                                required
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                            <input
                                name="newPassword"
                                type="password"
                                required
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg shadow-red-500/30 flex items-center transition-all transform hover:-translate-y-0.5"
                        >
                            <Lock size={20} className="mr-2" />
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}
