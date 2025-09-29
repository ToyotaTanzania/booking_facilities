'use client'
import { api } from "@/trpc/react";

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import type { ColDef, ICellRendererParams, ValueGetterParams } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useMemo, useState } from 'react'
import { Approve } from "@/app/(dashboard)/bookings.back/components/approve"

type ResponsibleFacilityRow = {
  id: number
  facility: {
    id: number
    name: string
    capacity: number
    type?: string | null
    building?: { id: number; name: string; location?: string | null } | null
  } | null
  name?: string | null
  email?: string | null
  phone?: string | null
  pendingCount: number
}

type PendingBookingRow = {
  id: number
  date: string
  status: string
  description: string | null
  facility: { id: number; name: string; building: { name: string; location: string } }
  slot: { id: number; start: string; end: string }
  user: { name: string | null; email: string | null; phone: string | null }
  schedule: number
}

export const GetResponsibleRooms =  () => {
  const { data, isLoading } = api.responsiblePerson.getMyFacilitiesWithPending.useQuery()

  const [rows, setRows] = useState<ResponsibleFacilityRow[]>([])
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null)

  const { data: pending, isLoading: isLoadingPending, refetch } = api.booking.getPendingByFacility.useQuery(
    selectedFacilityId!,
    { enabled: !!selectedFacilityId }
  )

  useEffect(() => {
    if (data) setRows(data as unknown as ResponsibleFacilityRow[])
  }, [data])

  const columnDefs = useMemo<ColDef<ResponsibleFacilityRow>[]>(() => [
    { headerName: 'Facility', valueGetter: (p: ValueGetterParams<ResponsibleFacilityRow>) => p.data?.facility?.name ?? '' },
    { headerName: 'Building', valueGetter: (p: ValueGetterParams<ResponsibleFacilityRow>) => p.data?.facility?.building?.name ?? '' },
    { headerName: 'Location', valueGetter: (p: ValueGetterParams<ResponsibleFacilityRow>) => p.data?.facility?.building?.location ?? '' },
    { headerName: 'Capacity', valueGetter: (p: ValueGetterParams<ResponsibleFacilityRow>) => p.data?.facility?.capacity ?? '' },
    { headerName: 'Pending', valueGetter: (p: ValueGetterParams<ResponsibleFacilityRow>) => p.data?.bookings?.length ?? 0 },
    {
      headerName: 'Actions',
      cellRenderer: (params: ICellRendererParams<ResponsibleFacilityRow>) => {
        const facilityId = params?.data?.facility?.id
        const onView = () => {
          if (!facilityId) return
          setSelectedFacilityId(facilityId)
          void refetch()
        }
        return (
          <button
            className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
            onClick={onView}
            disabled={!facilityId}
          >
            View bookings
          </button>
        )
      },
      width: 160,
      pinned: 'right'
    }
  ], [refetch])

  const defaultColDef = useMemo<ColDef<ResponsibleFacilityRow>>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 120
  }), [])

  const pendingColumnDefs = useMemo<ColDef<PendingBookingRow>[]>(() => ([
    { headerName: 'Date', valueGetter: (p) => p.data?.date ? new Date(p.data.date).toLocaleDateString() : '' },
    { headerName: 'Start', valueGetter: (p) => p.data?.slot?.start ?? '' },
    { headerName: 'End', valueGetter: (p) => p.data?.slot?.end ?? '' },
    { headerName: 'User', valueGetter: (p) => p.data?.user?.name ?? '' },
    { headerName: 'Email', valueGetter: (p) => p.data?.user?.email ?? '' },
    { headerName: 'Description', valueGetter: (p) => p.data?.description ?? '' },
    {
      headerName: 'Actions',
      cellRenderer: (params: ICellRendererParams<PendingBookingRow>) => {
        const row = params.data
        if (!row) return null
        const bookingForApprove = {
          date: row.date,
          slot: row.slot?.id,
          facility: row.facility?.id,
          schedule: row.schedule,
          status: row.status,
          description: row.description,
        }
        return (
          <div className="flex items-center">
            <Approve 
              booking={bookingForApprove} 
              open={false} 
              onOpenChange={(o) => { console.debug('Approve dialog open state:', o) }} 
            />
          </div>
        )
      },
      width: 160,
      pinned: 'right'
    },
  ]), [])

  const pendingDefaultColDef = useMemo<ColDef<PendingBookingRow>>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 120
  }), [])

  if (isLoading) return <div> Loading... </div>

  return (
    <div className="flex flex-col gap-4">
      <div className="ag-theme-quartz" style={{ height: 400, width: '100%' }}>
        <AgGridReact<ResponsibleFacilityRow>
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows
        />
      </div>

      {selectedFacilityId && (
        <div className="rounded border p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Pending bookings</h3>
            <button
              className="text-xs text-gray-600"
              onClick={() => setSelectedFacilityId(null)}
            >
              Close
            </button>
          </div>
          {isLoadingPending ? (
            <div>Loading pending…</div>
          ) : (
            <div className="ag-theme-quartz" style={{ height: 300, width: '100%' }}>
              <AgGridReact<PendingBookingRow>
                rowData={(pending ?? []) as unknown as PendingBookingRow[]}
                columnDefs={pendingColumnDefs}
                defaultColDef={pendingDefaultColDef}
                animateRows
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}