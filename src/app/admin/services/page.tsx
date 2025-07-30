"use client"

import React, { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Database } from "@/types/supabase"

type Service = Database["public"]["Tables"]["services"]["Row"] & {
  assigned_coupon_id: string | null
}

type Coupon = Database["public"]["Tables"]["coupons"]["Row"]

export default function AdminServicesPage() {
  const supabase = createClientComponentClient<Database>()
  const [services, setServices] = useState<Service[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null)
  const [editedService, setEditedService] = useState<Partial<Service>>({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .order("id", { ascending: true })

      const { data: couponsData, error: couponsError } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false })

      if (servicesError) {
        toast.error("Failed to load services: " + servicesError.message)
      } else {
        setServices(servicesData || [])
      }

      if (couponsError) {
        toast.error("Failed to load coupons: " + couponsError.message)
      } else {
        setCoupons(couponsData || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const startEditing = (service: Service) => {
    setEditingServiceId(service.id)
    setEditedService({
      name: service.name,
      description: service.description,
      base_price: service.base_price,
      price_per_user: service.price_per_user,
      assigned_coupon_id: service.assigned_coupon_id || null,
      is_active: service.is_active,
    })
  }

  const cancelEditing = () => {
    setEditingServiceId(null)
    setEditedService({})
  }

  const saveService = async () => {
    if (editingServiceId === null) return

    // Validate required fields
    if (!editedService.name || editedService.base_price === undefined || editedService.price_per_user === undefined) {
      toast.error("Name, Base Price, and Price Per User are required.")
      return
    }

    const { error } = await supabase
      .from("services")
      .update({
        name: editedService.name,
        description: editedService.description,
        base_price: editedService.base_price,
        price_per_user: editedService.price_per_user,
        assigned_coupon_id: editedService.assigned_coupon_id,
        is_active: editedService.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingServiceId)

    if (error) {
      toast.error("Failed to update service: " + error.message)
    } else {
      toast.success("Service updated successfully.")
      setEditingServiceId(null)
      setEditedService({})
      // Refresh services list
      const { data: refreshedServices } = await supabase
        .from("services")
        .select("*")
        .order("id", { ascending: true })
      setServices(refreshedServices || [])
    }
  }

  const toggleActive = async (service: Service) => {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !service.is_active, updated_at: new Date().toISOString() })
      .eq("id", service.id)

    if (error) {
      toast.error("Failed to update service status: " + error.message)
    } else {
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s))
      )
      toast.success(`Service ${!service.is_active ? "activated" : "deactivated"}.`)
    }
  }

  if (loading) {
    return <p>Loading services...</p>
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Services</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Price Per User</TableHead>
            <TableHead>Coupon</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>{service.id}</TableCell>
              <TableCell>
                {editingServiceId === service.id ? (
                  <Input
                    value={editedService.name || ""}
                    onChange={(e) => setEditedService({ ...editedService, name: e.target.value })}
                  />
                ) : (
                  service.name
                )}
              </TableCell>
              <TableCell>
                {editingServiceId === service.id ? (
                  <Input
                    value={editedService.description || ""}
                    onChange={(e) => setEditedService({ ...editedService, description: e.target.value })}
                  />
                ) : (
                  service.description || "-"
                )}
              </TableCell>
              <TableCell>
                {editingServiceId === service.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editedService.base_price?.toString() || ""}
                    onChange={(e) => setEditedService({ ...editedService, base_price: parseFloat(e.target.value) })}
                  />
                ) : (
                  `$${service.base_price.toFixed(2)}`
                )}
              </TableCell>
              <TableCell>
                {editingServiceId === service.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editedService.price_per_user?.toString() || ""}
                    onChange={(e) => setEditedService({ ...editedService, price_per_user: parseFloat(e.target.value) })}
                  />
                ) : (
                  `$${service.price_per_user.toFixed(2)}`
                )}
              </TableCell>
              <TableCell>
                {editingServiceId === service.id ? (
                  <Select
                    value={editedService.assigned_coupon_id || ""}
                    onValueChange={(val) => setEditedService({ ...editedService, assigned_coupon_id: val || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select coupon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {coupons.map((coupon) => (
                        <SelectItem key={coupon.id} value={coupon.id}>
                          {coupon.code} ({coupon.discount_percent}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  service.assigned_coupon_id
                    ? coupons.find(c => c.id === service.assigned_coupon_id)?.code || "-"
                    : "-"
                )}
              </TableCell>
              <TableCell>
                <input
                  type="checkbox"
                  checked={service.is_active}
                  onChange={() => toggleActive(service)}
                  disabled={editingServiceId === service.id}
                />
              </TableCell>
              <TableCell>
                {editingServiceId === service.id ? (
                  <>
                    <Button variant="outline" size="sm" onClick={cancelEditing} className="mr-2">
                      Cancel
                    </Button>
                    <Button variant="default" size="sm" onClick={saveService}>
                      Save
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => startEditing(service)}>
                    Edit
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}