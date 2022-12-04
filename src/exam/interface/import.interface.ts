export interface IRawQuestionsData {
    Order: number
    Question: string
    CorrectOption: number
    Option1: string
    Option2?: string
    Option3?: string
    Option4?: string
    Score: number
    Explaination?: string
}

export interface IRawQuestionGroupData {
    Type: string
    Title?: string
    Content?: string
}