import { eventBody } from "../../utils/attendance/eventBody"
import { useUploadEvents, useUrlParams } from "dhis2-semis-functions"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { DisaleButtonsState } from "../../schema/attendance/disableAllBtns"
import { useDaveValuesProps } from "../../types/attendance/attendanceTypes"
import { allStudents } from '../../schema/students/allStudentList';

export function useSaveValues({ setLoading, dataStoreData, setRefetch, setSelected, setOpen }: useDaveValuesProps) {
    const { useQuery } = useUrlParams()
    const date = useQuery.get('selectedDate')!
    const { uploadValues } = useUploadEvents()
    const disable = useSetRecoilState(DisaleButtonsState)
    const students = useRecoilValue(allStudents)

    async function formSubmit(values: any) {
        setLoading(true)
        let events = []
        for (const tei of students) {
            const eventId = tei?.[date]?.eventId ?? null
            
            events.push(eventBody({
                tei: tei.trackedEntity,
                event: eventId,
                program: tei.programId,
                stage: dataStoreData?.attendance?.programStage,
                absenceReason: dataStoreData?.attendance?.absenceReason,
                de: dataStoreData?.attendance?.status,
                ou: tei.orgUnitId,
                enrollment: tei.enrollmentId,
                date: date
            }, values.status))
        }
        
        await uploadValues({ events: events }, 'COMMIT', 'CREATE_AND_UPDATE')
            .then(() => { disable(false); setLoading(false); setRefetch((prev: any) => (!prev)); setOpen(false); setSelected([]) })
            .catch(() => { setLoading(false); disable(false) })
    }

    return { formSubmit }
}
