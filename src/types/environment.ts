export interface EnvironmentDefinitionDto {
    environmentId:     string;
    artifactsFolder:   string;
    wlstToolPath:      string;
    notifyOnComplete:  boolean;
    smtpHost:          string;
    smtpPort:          number;
    smtpUsername:      string;
    smtpPassword:      string;
    successEmailSubject: string;
    successRecipients: string[];
    failureRecipients: string[];
}
