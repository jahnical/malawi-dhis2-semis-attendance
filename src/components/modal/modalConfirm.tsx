import { NoticeBox } from '@dhis2/ui'
import { ModalComponent } from 'dhis2-semis-components'
import { D2I18n } from 'dhis2-semis-types'

export default function ConfirmModal({ open, setOpen, onSave, i18n, selectedOption }: { i18n: D2I18n, onSave: () => void, open: boolean, setOpen: (open: boolean) => void, selectedOption: { value: string, label: string } }) {

    return (
        <ModalComponent
            children={
                <div>
                    <NoticeBox title={`${i18n.t('Warning')}! ${i18n.t("All listed learners will be affected")}`} warning>
                        {i18n.t(`The ${selectedOption.label} attendance status will be assigned to all learners`)}!
                    </NoticeBox>

                    <p style={{ margin: "25px 0" }}>{i18n.t(`Are you sure you want to mark all as ${selectedOption.label}?`)}!</p>
                </div>
            }
            handleClose={() => setOpen(false)}
            open={open}
            showActions
            size='medium'
            position='top'
            actions={[
                { name: i18n.t("Cancel"), onClick: () => setOpen(false) },
                { name: i18n.t("Yes im sure"), destructive: true, onClick: async () => onSave() }
            ] as unknown as any}
        />
    )
}