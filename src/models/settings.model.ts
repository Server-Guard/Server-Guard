export enum CollectableData {
	PHONE = "phone",
	EMAIL = "email",
	AGE = "age",
}

export interface Settings {
	collectExtraData: boolean,
	collectedData: CollectableData[]
}

export const settingsFactory = () : Settings => ({
	collectExtraData: false,
	collectedData: []
})