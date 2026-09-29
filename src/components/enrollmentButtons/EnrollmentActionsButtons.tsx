import React, { useEffect, useState } from 'react'
import { ButtonStrip, IconUserGroup16, IconAddCircle24 } from "@dhis2/ui";
import styles from './enrollmentActionsButtons.module.css'
import { useGetSectionTypeLabel, useUrlParams, unavailableSchoolDays, useShowAlerts, useCheckFilters, useIncrementDays, getSectionLabels } from 'dhis2-semis-functions';
import { Form } from "react-final-form";
import { DataExporter, DataImporter, CustomDropdown as DropdownButton, DropDownCalendar } from 'dhis2-semis-components';
import { getAttendanceDEHeaders } from '../../utils/common/getAttendanceDEHeaders';
import { EnrollmentButtonsProps } from '../../types/enrollmentButons/enrollmentButtonsTypes';
import { format, subDays } from "date-fns";
import { generateattendanceHeaders } from '../../utils/header/generateAttendanceDays';
import { Tooltip } from '@mui/material';
import { Event } from '@mui/icons-material';
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';
import { useSchoolCalendarKey } from 'dhis2-semis-components';

function EnrollmentActionsButtons(props: EnrollmentButtonsProps) {
    const { setRefetch, setIsTableReady, selectedDataStoreKey, setattendanceHeaders, setSelectedDates, i18n, baseUrl } = props
    const { dataStoreData, program: programData } = useGetSelectedKeys()
    const { urlParameters, add } = useUrlParams();
    const { sectionName } = useGetSectionTypeLabel();
    const sectionLabels = getSectionLabels(sectionName, i18n);
    const { unavailableDays } = unavailableSchoolDays()
    const [editModeValue, setEditModeValue] = useState<any>("")
    const { school: orgUnit, academicYear, attendanceMode, selectedDate } = urlParameters;
    const [viewModeValue, setViewModeValue] = useState<any>({ selectedDate: selectedDate ? new Date(selectedDate) : new Date() })
    const { getValidDays } = generateattendanceHeaders({ setattendanceHeaders, setSelectedDates, isEnable: dataStoreData?.attendance?.attendanceStatus?.allowAttendanceStatus })
    const { getDataElementsHeaders } = getAttendanceDEHeaders({ setattendanceHeaders })
    const { areAllSelected, getFilters } = useCheckFilters({ filters: (dataStoreData.filters.dataElements ?? []) as unknown as any })
    const { hide, show } = useShowAlerts()
    const { schoolCalendar, defaults, academicYear: academicYearId } = useSchoolCalendarKey()
    const defaultAcademicYear = schoolCalendar?.find((x: any) => x?.academicYear?.code == defaults?.academicYear)
    const { getDate } = useIncrementDays()
    const showAlert = (error: any) => {
        show({ message: `${i18n.t('Unknown error')}: ${error}`, type: { critical: true } })
        setTimeout(hide, 5000);
    }
    const start = new Date(viewModeValue?.selectedDate ?? selectedDate)

    const enrollmentOptions: any = [
        {
            label: <DataImporter
                baseURL={baseUrl}
                label={i18n.t('Import {{section}} attendance', {
                    section: sectionLabels.title,
                })}
                module='attendance'
                onError={(e: any) => { showAlert(e) }}
                programConfig={programData!}
                sectionType={sectionName}
                selectedSectionDataStore={selectedDataStoreKey}
                updating={false}
                onClose={() => setRefetch((prev: any) => !prev)}
                title={i18n.t('Bulk attendance')!}
            />,
            divider: true,
            disabled: false,
        },
        {
            label: <DataExporter
                Form={Form}
                eventFilters={[
                    ...(academicYear ? [`${academicYearId}:in:${academicYear}`] : []),
                    ...getFilters() as unknown as any
                ]}
                baseURL={baseUrl}
                isSchoolDay={unavailableDays}
                label={i18n.t('Export {{section}} attendance', {
                    section: sectionLabels.title,
                })}
                module='attendance'
                onError={(e: any) => { showAlert(e) }}
                programConfig={programData!}
                sectionType={sectionName}
                selectedSectionDataStore={selectedDataStoreKey}
                empty={false}
                stagesToExport={[selectedDataStoreKey?.attendance?.programStage as unknown as string]}
            />,
            divider: false,
            disabled: false,
        },
    ];

    useEffect(() => {
        if (defaultAcademicYear || editModeValue) {
            setIsTableReady(false)
            const formated = format(new Date(start), "yyyy-MM-dd")
            const fiveDaysBefore = format(subDays(new Date(start), 4), 'yyyy-MM-dd');
            add('attendanceMode', 'view')
            add('selectedDate', formated)
            getValidDays(start, defaultAcademicYear)
            setSelectedDates((prev: any) => ({ occurredAfter: fiveDaysBefore, occurredBefore: getDate({ selectedDate: start }) }))
        }
    }, [viewModeValue])

    useEffect(() => {
        if (editModeValue || attendanceMode == 'edit') {
            setIsTableReady(false)
            let currentDate = format(new Date(editModeValue?.selectedDate ?? selectedDate), "yyyy-MM-dd")
            const fiveDaysBefore = format(subDays(new Date(currentDate), 1), 'yyyy-MM-dd');
            add('selectedDate', currentDate)
            add('attendanceMode', 'edit')

            setSelectedDates((prev: any) => ({ occurredAfter: fiveDaysBefore, occurredBefore: getDate({ selectedDate: new Date(currentDate) }) }))
            getDataElementsHeaders(programData, selectedDataStoreKey?.['attendance']?.programStage)
        }
    }, [editModeValue])

    return (
        <div className={styles.container}>
            <ButtonStrip className={styles.work_buttons}>
                {/* {attendanceMode == 'edit' && <Button destructive={selectable} onClick={() => setSelectable((prev: any) => !prev)} icon={<PlaylistAddCheckCircleOutlined />}> {selectable ? `Cancel multi-attendance` : `Multi-attendance`}</Button>} */}
                <Tooltip title={orgUnit === null ? i18n.t('Please select an organisation unit before') : ""}>
                    <DropDownCalendar config={defaultAcademicYear as unknown as any} dateDisabler={unavailableDays as unknown as any} label={i18n.t('Take attendance')!} icon={<IconAddCircle24 />} setValue={(e) => setEditModeValue(() => ({ ...e }))} value={editModeValue} />
                </Tooltip>

                <Tooltip title={orgUnit === null ? i18n.t('Please select an organisation unit before') : ""}>
                    <DropDownCalendar config={defaultAcademicYear as unknown as any} dateDisabler={unavailableDays as unknown as any} label={i18n.t('View attendance records')!} icon={<Event />} setValue={(e) => setViewModeValue(() => ({ ...e }))} value={viewModeValue} />
                </Tooltip>

                {attendanceMode != 'edit' &&
                    <Tooltip title={!areAllSelected() ? i18n.t("Please select all filters") : ""}>
                        <span>
                            <DropdownButton
                                name={<span className={styles.work_buttons_text}>{i18n.t('Bulk attendance')}</span> as unknown as string}
                                disabled={!!(orgUnit == undefined || !areAllSelected() || academicYear == undefined)}
                                icon={<IconUserGroup16 />}
                                options={enrollmentOptions}
                            />
                        </span>
                    </Tooltip>
                }
            </ButtonStrip>
        </div>
    )
}

export default EnrollmentActionsButtons
