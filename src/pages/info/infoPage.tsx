import { InfoPage } from "dhis2-semis-components";
import { D2I18n } from "dhis2-semis-types";
import { getInfoInstructions, useSectionProfile } from "dhis2-semis-functions";
import useGetSelectedKeys from "../../hooks/config/useGetSelectedKeys";

export default function InfoPageHolder({ i18n }: { i18n: D2I18n }) {
    const { dataStoreData, program } = useGetSelectedKeys()
    // Student attendance is taken per class, so its filters are required; staff filters only narrow the list
    const { attendanceRequiresAllFilters } = useSectionProfile()

    return (
        <InfoPage
            title={i18n.t("SEMIS-Attendance")}
            sections={[
                {
                    sectionTitle: i18n.t("Follow the instructions to proceed"),
                    instructions: getInfoInstructions({
                        i18n,
                        filters: (dataStoreData?.filters?.dataElements ?? []) as any,
                        program: program as any,
                        academicYear: "optional",
                        sectionFilters: attendanceRequiresAllFilters ? "required" : "optional",
                    })
                }
            ]}
        />
    )
}