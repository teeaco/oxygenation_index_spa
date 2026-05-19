/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ErrorResponse {
  error: string;
}

export interface CartResponse {
  request_id?: number | null;
  items_count: number;
  has_draft: boolean;
}

export interface AddServiceToDraftRequest {
  service_id: number;
}

export interface AddServiceToDraftResponse {
  request_id?: number;
  cart?: CartResponse;
}

export interface UpdateRequestServiceRequest {
  doctor_comment?: string;
}

export interface UpdateRequestRequest {
  patient_name?: string;
  blood_value_pao2?: number;
  fio2_value?: number;
}

export interface ReviewRequestRequest {
  action: "complete" | "reject";
}

export interface RequestServiceResponse {
  request_id?: number;
  service_id?: number;
  service_name?: string;
  image_url?: string;
  video_url?: string;
  benchmark?: string;
  doctor_comment?: string;
  result_coefficient?: number | null;
}

export interface RequestResponse {
  id?: number;
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  formed_at?: string;
  /** @format date-time */
  completed_at?: string;
  creator_login?: string;
  moderator_login?: string;
  patient_name?: string;
  blood_value_pao2?: number | null;
  fio2_value?: number | null;
  primary_service?: string;
  result_coefficient?: number | null;
  result?: string;
  results_count?: number;
  items?: RequestServiceResponse[];
}

export interface RequestListResponse {
  items?: RequestResponse[];
}

export interface UpdateRequestServiceParams {
  requestId: number;
  serviceId: number;
}

export interface DeleteRequestServiceParams {
  requestId: number;
  serviceId: number;
}

export interface ListRequestsParams {
  status?: "formed" | "completed" | "rejected";
  formed_from?: string;
  formed_to?: string;
}

export interface GetRequestByIdParams {
  id: number;
}

export interface UpdateRequestParams {
  id: number;
}

export interface DeleteRequestParams {
  id: number;
}

export interface FormRequestParams {
  id: number;
}

export interface ReviewRequestParams {
  id: number;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title RIP Oxygenation Request API
 * @version 7.0.0
 * @baseUrl /api
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  oxygenationRequest = {
    /**
     * No description
     *
     * @tags oxygenationRequest
     * @name GetCart
     * @summary Get cart summary
     * @request GET:/oxygenation_request/cart
     * @response `200` `CartResponse` OK
     */
    getCart: (params: RequestParams = {}) =>
      this.request<CartResponse, any>({
        path: `/oxygenation_request/cart`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags oxygenationRequest
     * @name ListRequests
     * @request GET:/oxygenation_request
     * @secure
     * @response `200` `RequestListResponse` OK
     */
    listRequests: (query: ListRequestsParams, params: RequestParams = {}) =>
      this.request<RequestListResponse, any>({
        path: `/oxygenation_request`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags oxygenationRequest
     * @name GetRequestById
     * @request GET:/oxygenation_request/{id}
     * @secure
     * @response `200` `RequestResponse` OK
     */
    getRequestById: (
      { id }: GetRequestByIdParams,
      params: RequestParams = {},
    ) =>
      this.request<RequestResponse, any>({
        path: `/oxygenation_request/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags oxygenationRequest
     * @name UpdateRequest
     * @request PUT:/oxygenation_request/{id}
     * @secure
     * @response `200` `RequestResponse` OK
     */
    updateRequest: (
      { id }: UpdateRequestParams,
      data: UpdateRequestRequest,
      params: RequestParams = {},
    ) =>
      this.request<RequestResponse, any>({
        path: `/oxygenation_request/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags oxygenationRequest
     * @name DeleteRequest
     * @request DELETE:/oxygenation_request/{id}
     * @secure
     * @response `204` `void` No Content
     */
    deleteRequest: ({ id }: DeleteRequestParams, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/oxygenation_request/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags oxygenationRequest
     * @name FormRequest
     * @request PUT:/oxygenation_request/{id}/form
     * @secure
     * @response `200` `RequestResponse` OK
     */
    formRequest: ({ id }: FormRequestParams, params: RequestParams = {}) =>
      this.request<RequestResponse, any>({
        path: `/oxygenation_request/${id}/form`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags oxygenationRequest
     * @name ReviewRequest
     * @request PUT:/oxygenation_request/{id}/review
     * @secure
     * @response `200` `RequestResponse` OK
     */
    reviewRequest: (
      { id }: ReviewRequestParams,
      data: ReviewRequestRequest,
      params: RequestParams = {},
    ) =>
      this.request<RequestResponse, any>({
        path: `/oxygenation_request/${id}/review`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  requestServices = {
    /**
     * No description
     *
     * @tags requestServices
     * @name AddServiceToDraft
     * @request POST:/request-services
     * @secure
     * @response `201` `AddServiceToDraftResponse` Created
     */
    addServiceToDraft: (
      data: AddServiceToDraftRequest,
      params: RequestParams = {},
    ) =>
      this.request<AddServiceToDraftResponse, any>({
        path: `/request-services`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags requestServices
     * @name UpdateRequestService
     * @request PUT:/request-services/{requestID}/{serviceID}
     * @secure
     * @response `200` `RequestServiceResponse` OK
     */
    updateRequestService: (
      { requestId, serviceId }: UpdateRequestServiceParams,
      data: UpdateRequestServiceRequest,
      params: RequestParams = {},
    ) =>
      this.request<RequestServiceResponse, any>({
        path: `/request-services/${requestId}/${serviceId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags requestServices
     * @name DeleteRequestService
     * @request DELETE:/request-services/{requestID}/{serviceID}
     * @secure
     * @response `204` `void` No Content
     */
    deleteRequestService: (
      { requestId, serviceId }: DeleteRequestServiceParams,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/request-services/${requestId}/${serviceId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
}
