import { useCheckFilters, useShowAlerts, useUploadEvents, useUrlParams, formatTrackerError } from "dhis2-semis-functions";
import useGetSelectedKeys from "../config/useGetSelectedKeys"
import { useSchoolCalendarKey } from "dhis2-semis-components";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { completenessLoading } from "../../schema/attendance/completenessLoading";
import { classAttendanceEvent } from "../../schema/attendance/classAttendanceEvent";

export function useAttendanceCompleteness() {
    const setCompletenessLoading = useSetRecoilState(completenessLoading)
    const { dataStoreData } = useGetSelectedKeys()
    const { urlParameters } = useUrlParams();
    const { academicYear: academicYearId } = useSchoolCalendarKey()
    const { school, academicYear, selectedDate } = urlParameters;
    const { getUrlParamsAsObject } = useCheckFilters({ filters: (dataStoreData?.filters?.dataElements ?? []) as unknown as any })
    const { uploadValues } = useUploadEvents()
    const { show } = useShowAlerts()
    const savedAttendanceEvent = useRecoilValue(classAttendanceEvent)

    const completeOrDelete = async (operation: 'delete' | 'create', completed?: boolean) => {
        setCompletenessLoading((prev) => ({ ...prev, loading: true }))
        const importStrategy = operation == 'delete' ? 'DELETE' : 'CREATE_AND_UPDATE'

        const eventData = operation == 'delete' ? { event: savedAttendanceEvent?.event } : {
            ...(savedAttendanceEvent?.event ? { event: savedAttendanceEvent?.event } : {}),
            program: dataStoreData.attendance.attendanceStatus?.program,
            programStage: dataStoreData.attendance.attendanceStatus?.programStage,
            orgUnit: school,
            dataValues: [
                {
                    dataElement: academicYearId,
                    value: academicYear
                },
                {
                    dataElement: dataStoreData.attendance.attendanceStatus?.status,
                    value: savedAttendanceEvent?.event ? true : completed
                },
                ...(dataStoreData?.filters?.dataElements?.map((filter: any) => ({
                    dataElement: filter.dataElement,
                    value: getUrlParamsAsObject()[filter.ulrParam]
                })) ?? [])
            ],
            eventDate: selectedDate,
            occurredAt: selectedDate
        }

        await uploadValues({ events: [eventData] }, 'COMMIT', importStrategy, { silent: true })
            .then((resp: any) => {
                if (resp?.validationReport?.errorReports?.length > 0) {
                    // Show the server's reason (e.g. a validation rule) instead of a generic error
                    show({
                        message: `${("Could not save attendance")}: ${formatTrackerError(resp)}`,
                        type: { critical: true, duration: 15000 }
                    });
                }
            }).finally(() => setCompletenessLoading((prev: any) => ({ ...prev, refetch: !prev?.refetch })))

    }

    return { completeOrDelete }
}