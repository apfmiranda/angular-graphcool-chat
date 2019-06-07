import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileModel } from '../models/file.model';
import { GraphcoolConfig, GRAPHCOOL_CONFIG } from '../providers/graphcool-config.provider';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private http: HttpClient,
    @Inject(GRAPHCOOL_CONFIG) private graphcoolConfig: GraphcoolConfig,
  ) { }

  upload(file: File): Observable<FileModel> {
    const formdata = new FormData();
    formdata.append('data', file);

    return this.http.post<FileModel>(this.graphcoolConfig.fileAPI, formdata);
  }
}
