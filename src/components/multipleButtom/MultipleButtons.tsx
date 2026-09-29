import React, { useEffect, useState } from "react";
import styles from "./button.module.css";
import classNames from "classnames";
import { ButtonProps } from "../../types/MultipleBtns/MultipleButtonsTypes";
import { useShowAlerts, useUploadEvents, useUrlParams, formatTrackerError } from "dhis2-semis-functions";
import { eventBody } from "../../utils/attendance/eventBody";
import { TableDataState } from "../../schema/table/tableDataSchema";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { TableDataRefetch } from "dhis2-semis-types";
import { CircularLoader } from "@dhis2/ui";
import { Button, ButtonGroup } from "@mui/material";
import { classAttendanceEvent } from "../../schema/attendance/classAttendanceEvent";
import { useAttendanceCompleteness } from "../../hooks/attendance/attendanceCompleteness";

export default function MultipleButtons(props: ButtonProps) {
    const { items, status, disabled, ...rest } = props;
    const [selected, setSelected] = useState<any>("")
    const { show } = useShowAlerts()
    const [tableValues, setTableValues] = useRecoilState(TableDataState)
    const setRefetch = useSetRecoilState(TableDataRefetch);
    const { uploadValues } = useUploadEvents()
    const { urlParameters, add, remove, useQuery } = useUrlParams();
    const { selectedDate } = urlParameters
    const attendanceEvent = useRecoilValue(classAttendanceEvent)
    const { completeOrDelete } = useAttendanceCompleteness()

    useEffect(() => setSelected(status), [status])

    const onchangeValue = async (value: string) => {
        if (value !== status) {
            add('position', `${value}${rest.tei}`)

            await uploadValues({ events: [eventBody({ ...rest, date: selectedDate }, value)] }, 'COMMIT', 'CREATE_AND_UPDATE', { silent: true })
                .then(async (resp: any) => {
                    if (resp?.validationReport?.errorReports?.length > 0) {
                        // Show the server's reason (e.g. a validation rule) instead of a generic error
                        show({
                            message: `${("Could not save attendance")}: ${formatTrackerError(resp)}`,
                            type: { critical: true, duration: 15000 }
                        });
                        remove('position')
                    } else {

                        const event = resp?.bundleReport?.typeReportMap?.EVENT?.objectReports?.[0]?.uid
                        let copy = [...tableValues], index = tableValues?.findIndex((x: any) => x.trackedEntity === rest.tei)

                        if (rest?.absenceReason === rest?.de) {
                            copy[index] = { ...copy[index], [rest.date]: { ...copy[index][rest.date], absenceReason: value }, replace: true }
                        } else {
                            copy[index] = { ...copy[index], [rest.date]: { ...copy[index][rest.date], eventId: event, status: value, absenceOption: undefined }, replace: true }
                        }

                        remove('position')
                        setTableValues(copy)
                        setSelected(value)
                        setRefetch((prev: any) => !prev)
                        if (!attendanceEvent) await completeOrDelete("create", false)
                    }
                })
        }
    }

    return (
        <ButtonGroup color="primary">
            {items?.map((item) => {
                return (
                    <Button disabled={!!(disabled || (useQuery.get('position') != undefined && useQuery.get('position') != `${item?.code}${rest.tei}`))} key={item?.code}
                        className={classNames(
                            selected === item?.code && styles["active-button"],
                            styles.label,
                        )}
                        onClick={async () => { await onchangeValue(item.code) }}
                    >
                        <span className={styles.simpleButtonLabel}>
                            {
                                (useQuery.get('position') != undefined && useQuery.get('position') == `${item?.code}${rest.tei}`)
                                    ? <CircularLoader small /> :
                                    item.Component
                            }
                        </span>
                    </Button>
                )
            })}
        </ButtonGroup>
    );
}
