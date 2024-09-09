import DocumentCard from '../../../../../components/document/DocumentCard';
import { getPermissions, getWorkspace } from '@/lib/workspace-helper';
import { createClient } from '@/utils/supabase/server';
import { DocumentPlusIcon } from '@heroicons/react/24/solid';
import { Button } from '@repo/ui/components/ui/button';
import { Separator } from '@repo/ui/components/ui/separator';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

interface Props {
  params: {
    wsId: string;
  };
}

export default async function DocumentsPage({ params: { wsId } }: Props) {
  const ws = await getWorkspace(wsId);
  const documents = await getDocuments(wsId);

  const { withoutPermission } = await getPermissions({
    wsId,
  });

  if (withoutPermission('manage_documents')) redirect(`/${wsId}`);

  const t = await getTranslations('documents');

  const newDocumentLabel = t('new-document');
  const noDocumentsLabel = t('no-documents');
  // const createDocumentErrorLabel = t('create-document-error');
  // const createNewDocumentLabel = t('create-new-document');

  // async function createDocument({
  //   wsId,
  //   doc,
  // }: {
  //   wsId: string;
  //   doc: Partial<Document>;
  // }) {
  //   if (!ws) return;

  //   const res = await fetch(`/api/workspaces/${ws.id}/documents`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       name: doc.name,
  //     }),
  //   });

  //   if (!res.ok) {
  // showNotification({
  //   title: 'Error',
  //   message: createDocumentErrorLabel,
  //   color: 'red',
  // });
  //     return;
  //   }

  //   const { id } = await res.json();
  //   redirect(`/${wsId}/documents/${id}`);
  // }

  // function showDocumentEditForm() {
  // openModal({
  //   title: <div className="font-semibold">{createNewDocumentLabel}</div>,
  //   centered: true,
  //   children: (
  //     <DocumentEditForm
  //       onSubmit={(doc) => createDocument({ wsId: ws?.id, doc })}
  //     />
  //   ),
  // });
  // }

  return (
    <>
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <Button
        // onClick={showDocumentEditForm}
        >
          <DocumentPlusIcon className="h-4 w-4" />
          {newDocumentLabel}
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {documents && documents.length === 0 && (
          <div className="text-foreground/80 col-span-full">
            {noDocumentsLabel}
          </div>
        )}

        {ws &&
          documents &&
          documents?.map((doc) => (
            <DocumentCard key={`doc-${doc.id}`} wsId={ws?.id} document={doc} />
          ))}
      </div>
    </>
  );
}

async function getDocuments(wsId: string) {
  const supabase = createClient();

  const { data } = await supabase
    .from('workspace_documents')
    .select('id, name, content, created_at')
    .eq('ws_id', wsId)
    .order('created_at', { ascending: false });

  return data;
}
