<!--
GENERATED. DO NOT EDIT.
Source: spec/ydisk/, checked against provenance.json
Run: pnpm generate
-->

# API coverage

23 operations from openapi v1.

| Operation | Call | Command | Effect | Request source | Status | Summary |
|---|---|---|---|---|---|---|
| `GetDisk` | `GET /v1/disk` | `ydisk <profile> api disk-get` | read | — | generated | Получить метаинформацию о диске пользователя |
| `GetResource` | `GET /v1/disk/resources` | `ydisk <profile> api resources-list` | read | — | generated | Получить метаинформацию о файле или каталоге |
| `CreateResource` | `PUT /v1/disk/resources` | `ydisk <profile> api resources-create` | write | — | generated | Создать каталог |
| `UpdateResource` | `PATCH /v1/disk/resources` | `ydisk <profile> api resources-update` | write | contract | generated | Обновить пользовательские данные ресурса |
| `DeleteResource` | `DELETE /v1/disk/resources` | `ydisk <profile> api resources-delete` | destructive | — | generated | Удалить файл или папку |
| `CopyResource` | `POST /v1/disk/resources/copy` | `ydisk <profile> api resources-copy` | write | — | generated | Создать копию файла или папки |
| `GetResourceDownloadLink` | `GET /v1/disk/resources/download` | `ydisk <profile> api resources-download-link` | read | — | generated | Получить ссылку на скачивание файла |
| `GetFlatFilesList` | `GET /v1/disk/resources/files` | `ydisk <profile> api resources-files-list` | read | — | generated | Получить список файлов упорядоченный по имени |
| `GetLastUploadedFilesList` | `GET /v1/disk/resources/last-uploaded` | `ydisk <profile> api resources-last-uploaded-list` | read | — | generated | Получить список файлов упорядоченный по дате загрузки |
| `MoveResource` | `POST /v1/disk/resources/move` | `ydisk <profile> api resources-move` | write | — | generated | Переместить файл или папку |
| `ListPublicResources` | `GET /v1/disk/resources/public` | `ydisk <profile> api resources-public-list` | read | — | generated | Получить список опубликованных ресурсов |
| `PublishResource` | `PUT /v1/disk/resources/publish` | `ydisk <profile> api resources-publish` | write | contract | generated | Опубликовать ресурс |
| `UnpublishResource` | `PUT /v1/disk/resources/unpublish` | `ydisk <profile> api resources-unpublish` | write | — | generated | Отменить публикацию ресурса |
| `GetResourceUploadLink` | `GET /v1/disk/resources/upload` | `ydisk <profile> api resources-upload-link` | read | — | generated | Получить ссылку для загрузки файла |
| `UploadExternalResource` | `POST /v1/disk/resources/upload` | `ydisk <profile> api resources-upload-url` | write | — | generated | Загрузить файл в Диск по URL |
| `GetPublicResource` | `GET /v1/disk/public/resources` | `ydisk <profile> api public-resources-get` | read | — | generated | Получить метаинформацию о публичном файле или каталоге |
| `GetPublicResourceDownloadLink` | `GET /v1/disk/public/resources/download` | `ydisk <profile> api public-resources-download-link` | read | — | generated | Получить ссылку на скачивание публичного ресурса |
| `UpdatePublicSettings` | `PATCH /v1/disk/public/resources/public-settings` | `ydisk <profile> api public-settings-update` | write | contract | generated | Обновить настройки публичных ссылок |
| `SaveToDiskPublicResource` | `POST /v1/disk/public/resources/save-to-disk` | `ydisk <profile> api public-resources-save-to-disk` | write | — | generated | Сохранить публичный ресурс в папку Загрузки |
| `GetTrashResource` | `GET /v1/disk/trash/resources` | `ydisk <profile> api trash-resources-list` | read | — | generated | Получить содержимое Корзины |
| `ClearTrash` | `DELETE /v1/disk/trash/resources` | `ydisk <profile> api trash-resources-delete` | destructive | — | generated | Очистить Корзину |
| `RestoreFromTrash` | `PUT /v1/disk/trash/resources/restore` | `ydisk <profile> api trash-resources-restore` | write | — | generated | Восстановить ресурс из Корзины |
| `GetOperationStatus` | `GET /v1/disk/operations/{operation_id}` | `ydisk <profile> api operations-get` | read | — | generated | Получить статус асинхронной операции |

## Pagination

| Operation | Style | Request | Answer | Source |
|---|---|---|---|---|
| `GetResource` | offset | query `offset`, query `limit` | items `_embedded.items`, total `_embedded.total` | detected |
| `GetFlatFilesList` | offset | query `offset`, query `limit` | items `items` | detected |
| `ListPublicResources` | offset | query `offset`, query `limit` | items `items` | detected |
| `GetPublicResource` | offset | query `offset`, query `limit` | items `_embedded.items`, total `_embedded.total` | detected |
| `GetTrashResource` | offset | query `offset`, query `limit` | items `_embedded.items`, total `_embedded.total` | detected |

## Sign-in

Not from the source: The Swagger 1.2 source names no sign-in. <https://yandex.ru/dev/disk-api/doc/en/concepts/quickstart>: every request carries `Authorization: OAuth <token>`.

## Permission keys

| Operation | Key | When |
|---|---|---|
| `DeleteResource` | `files.delete` | always |
| `CopyResource` | `files.delete` | query `overwrite` is true |
| `MoveResource` | `files.delete` | query `overwrite` is true |
| `PublishResource` | `files.share` | always |
| `UnpublishResource` | `files.share` | always |
| `GetResourceUploadLink` | `files.delete` | query `overwrite` is true |
| `UpdatePublicSettings` | `files.share` | always |
| `ClearTrash` | `files.delete` | always |
| `RestoreFromTrash` | `files.delete` | query `overwrite` is true |

## Spec corrections

- left out /v1/data/admin/settings/{settings_name}/organizations/{org_id}: Yandex 360 organization settings for admins, not a person's Disk; <https://yandex.ru/dev/disk-api/doc/en/> does not describe it
