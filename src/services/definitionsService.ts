import { apiClient } from '@/services/api.client';
import { API_CONFIG } from '@/config/api.config';
import { EnvironmentDefinitionDto } from '@/types/environment';

export const definitionsService = {
    getDefinitions: async (environmentId: string): Promise<EnvironmentDefinitionDto> => {
        const { data, error } = await apiClient.get<EnvironmentDefinitionDto>(
            API_CONFIG.ENDPOINTS.DEFINITIONS.GET.replace(':environmentId', environmentId)
        );
        if (error) throw new Error(error);
        return data!;
    },

    updateDefinitions: async (
        environmentId: string,
        payload: EnvironmentDefinitionDto
    ): Promise<void> => {
        const { status, error } = await apiClient.put<void>(
            API_CONFIG.ENDPOINTS.DEFINITIONS.UPDATE.replace(':environmentId', environmentId),
            payload
        );
        if (status < 200 || status >= 300) throw new Error(error || `Update failed: ${status}`);
    }
};
