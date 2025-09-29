'use client'

import { api } from "@/trpc/react";

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import type { ColDef, ICellRendererParams, ValueGetterParams, RowClassParams } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useMemo, useState } from 'react'

type BookingRow = {
  id: number
  date: string
  status: string
  description: string | null
  facility: {
    id: number
    name: string
    type: string
    capacity: number
    building: { id: number; name: string; location: string }
  }
  slot: { id: number; start: string; end: string }
  user: { name: string | null; email: string | null; phone: string | null }
}

export const GetMyBookings =  () => {
  const utils = api.useUtils()
  const { data, isLoading } = api.booking.getMyBookings.useQuery()
  const removeMutation = api.booking.remove.useMutation({
    onSuccess: async () => {
      await utils.booking.getMyBookings.invalidate()
    }
  })
  
  const cancelMutation = api.booking.cancel.useMutation({
    onSuccess: async () => {
      await utils.booking.getMyBookings.invalidate()
    }
  })

  const [rows, setRows] = useState<BookingRow[]>([])

  useEffect(() => {
    if (data) setRows(data as unknown as BookingRow[])
  }, [data])

  const columnDefs = useMemo<ColDef<BookingRow>[]>(() => [
    { headerName: 'Date', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.date ? new Date(p.data.date).toLocaleDateString() : '' },
    { headerName: 'Status', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.status ?? '' },
    { headerName: 'Facility', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.facility?.name ?? '' },
    { headerName: 'Building', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.facility?.building?.name ?? '' },
    { headerName: 'Location', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.facility?.building?.location ?? '' },
    { headerName: 'Capacity', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.facility?.capacity ?? '' },
    { headerName: 'Start', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.slot?.start ?? '' },
    { headerName: 'End', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.slot?.end ?? '' },
    { headerName: 'User', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.user?.name ?? '' },
    { headerName: 'Email', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.user?.email ?? '' },
    { headerName: 'Phone', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.user?.phone ?? '' },
    { headerName: 'Description', valueGetter: (p: ValueGetterParams<BookingRow>) => p.data?.description ?? '' },
    {
      headerName: 'Actions',
      cellRenderer: (params: ICellRendererParams<BookingRow>) => {
        const id = params?.data?.id
        const onCancel = async () => {
          if (!id) return
          try {
            await cancelMutation.mutateAsync({ id })
          } catch {
            // handled by mutation observers
          }
        }
        const onRemove = () => {
          const rowId = params?.data?.id
          setRows(prev => prev.filter(r => r.id !== rowId))
        }
        return (
          <div className="flex gap-2">
            <button
              className="px-2 py-1 text-xs rounded bg-rose-600 text-white disabled:opacity-50"
              onClick={onCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelling…' : 'Cancel'}
            </button>
            <button
              className="px-2 py-1 text-xs rounded bg-gray-200"
              onClick={onRemove}
            >
              Remove
            </button>
          </div>
        )
      },
      width: 180,
      pinned: 'right'
    }
  ], [cancelMutation, cancelMutation.isPending])

  const defaultColDef = useMemo<ColDef<BookingRow>>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 120
  }), [])

  if (isLoading) return <div> Loading... </div>

  return (
    <div className="ag-theme-quartz" style={{ height: 600, width: '100%' }}>
      <AgGridReact<BookingRow>
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowStyle={(params: RowClassParams<BookingRow>) => {
          const status = params.data?.status
          if (status === 'confirmed') return { backgroundColor: '#ecfdf5' } // emerald-50
          if (status === 'pending') return { backgroundColor: '#fffbeb' }   // amber-50
          if (status === 'cancelled') return { backgroundColor: '#fff1f2' } // rose-50
          return {}
        }}
        animateRows
      />
    </div>
  )
}