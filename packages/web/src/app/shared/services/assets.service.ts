import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { CreateAssetRecordsRequestBodyType, CreateAssetRecordsSuccessResponseType } from '@api-spec/api-types';
import { firstValueFrom } from 'rxjs';
import { safeParse } from 'valibot';
import { environment } from '../../../environments/environment';
import { HttpErrorResponseSchema } from '../schemas/api-error.schema';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private readonly API_BASE_URL = environment.API_BASE_URL;
  private readonly http = inject(HttpClient);

  async registerAssets(body: CreateAssetRecordsRequestBodyType): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<CreateAssetRecordsSuccessResponseType>(`${this.API_BASE_URL}/assets`, body, {
          credentials: 'include',
        }),
      );

      alert('資産情報を登録しました');
    } catch (e) {
      const result = safeParse(HttpErrorResponseSchema, e);

      if (result.success && result.output.body) {
        alert(result.output.body.message);
      } else {
        alert('予期しないエラーが発生しました');
      }
    }
  }
}
