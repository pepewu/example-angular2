export type modalData = {
    component?: string,
    closeModal?: boolean,
    popupReady?: boolean,
    data?: any
}
export interface ModalComponent {
    postDataToModalsService(data: modalData): void
}