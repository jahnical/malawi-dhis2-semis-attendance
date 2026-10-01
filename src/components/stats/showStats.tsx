import { Button, ButtonStrip, IconCheckmarkCircle16, Tag } from "@dhis2/ui";
import { ModalComponent, SummaryCard, Table, WithPadding } from "dhis2-semis-components";
import styles from './showStats.module.css'
import { Collapse } from "@mui/material";
import { useState } from "react";
import { useHeader, useViewPortWidth } from "dhis2-semis-functions";
import { ProgramConfig, TableDataRefetch } from "dhis2-semis-types";
import { useSetRecoilState } from "recoil";
import useGetSelectedKeys from "../../hooks/config/useGetSelectedKeys";
import { InfoOutlined } from "@mui/icons-material";

export default function ShowStats({ stats, open, setOpen }: { setOpen: (args: boolean) => void, open: boolean, stats: any }) {
    const [showDetails, setShowDetails] = useState(false)
    const { dataStoreData, program: programData } = useGetSelectedKeys()
    const { viewPortWidth } = useViewPortWidth();
    const { columns } = useHeader({ dataStoreData, programConfigData: programData as unknown as ProgramConfig, programStage: "" });
    const setRefetch = useSetRecoilState(TableDataRefetch);

    return (
        <ModalComponent
            open={open}
            handleClose={() => setOpen(!open)}
            children={
                <div>
                    <Tag positive icon={<IconCheckmarkCircle16 />}> Learners promotion preview </Tag>

                    <WithPadding />
                    <label className={styles.title}>Summary</label>
                    <WithPadding />

                    <ButtonStrip>
                        <SummaryCard color="success" label="Promoted learners" value={stats?.posted ?? 0} />
                        <SummaryCard color="error" label="No promoted learners" value={stats?.conflicts?.length ?? 0} />
                    </ButtonStrip>

                    <WithPadding />
                    {stats?.conflicts?.length > 0 ?
                        <>
                            <ButtonStrip>
                                <Button small icon={<InfoOutlined />} onClick={() => setShowDetails(!showDetails)}>More details</Button>
                            </ButtonStrip>
                            <br />
                            <span style={{ color: "red" }}>The following learners were not promoted. They already exist on the selected academic year</span>
                        </>
                        : null}
                    <WithPadding />

                    <Collapse in={showDetails} style={{ marginBottom: "20px" }} >
                        <WithPadding>
                            <Table
                                programConfig={programData!}
                                viewPortWidth={viewPortWidth}
                                columns={columns}
                                tableData={stats.conflicts}
                                showHeaderFilters={false}
                                showWorkingListsContainer={false}
                                paginate={false}
                            />
                        </WithPadding>
                    </Collapse>

                    <ButtonStrip end>
                        <Button primary={true} onClick={() => { setOpen(false); setRefetch(prev => (!prev)) }} >
                            Close
                        </Button>
                    </ButtonStrip>
                </ div>
            }
            title="Learners Promotion Summary"
        />
    )
}