'use client';

/**
 * A GUIA — os dois documentos, gerados na hora, no celular.
 *
 * ⭐⭐ **O PDF é feito aqui, no navegador, no instante do toque.** Não é imagem
 * guardada nem arquivo de exemplo: é um PDF montado com os dados desta saída — e
 * por isso ele sai carimbado, na diagonal, com DEMONSTRAÇÃO · SEM VALOR FISCAL.
 * Um documento de demonstração que pareça verdadeiro é o começo de um problema
 * que ninguém quer ter.
 *
 * ⛔ **Nada aqui fala com órgão nenhum.** Não há SEFAZ, não há emissor, não há
 * rede. O que existe é a tela que a mesa vai usar quando o emissor entrar.
 */

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  documentosDe,
  estadoDoDocumento,
  eventosDe,
  frasedoEstado,
  marcaDeAtraso,
  motoristaDe,
  operacaoDe,
  pendenciasDeRetorno,
  veiculoDe,
} from '@/lib/remessa';
import {
  cancelarRemessa,
  marcarChegada,
  moverEquipamento,
  registrarRetorno,
  useMundo,
} from '@/lib/store';
import { comoEndereco, pdfDamdfe, pdfDanfe, type DadosDoDocumento } from '@/lib/pdf';
import { TENANT } from '@/lib/tenant';
import { data, dinheiro } from '@/lib/formato';
import { Botao, Cartao, Confirmar, Erro, Etiqueta, Sala, TituloSecao } from '@/components/ui';
import { Maquina } from '@/components/icones';
import type { DocumentoFiscal } from '@/data/seed';

const NOME_DO_ATO = {
  'saida-registrada': 'Saída registrada',
  'documento-autorizado': 'Documento autorizado',
  'manifesto-encerrado': 'Manifesto encerrado na chegada',
  'retorno-registrado': 'Retorno registrado',
  'remessa-cancelada': 'Remessa cancelada',
} as const;

export default function Guia() {
  const mundo = useMundo();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [chegando, setChegando] = useState<string | null>(null);
  const [voltando, setVoltando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  /**
   * ⭐ Os endereços de PDF desta tela. Nascem no carregamento — o PDF é montado
   * aqui, no navegador, com os dados desta saída — e são devolvidos ao sair.
   */
  const [pdfs, setPdfs] = useState<Record<string, string>>({});

  const remessa = mundo.remessas.find((r) => r.id === id);

  // ⚠️ Tudo que vem antes do desvio de "saída não encontrada" é calculado com o
  // cuidado de sobreviver sem ela: os ganchos do React não podem ficar depois de
  // um `return`, e a moldura do PDF é um gancho.
  const operacao = operacaoDe(mundo, remessa?.operacaoId ?? '');
  const veiculo = veiculoDe(mundo, remessa?.veiculoId ?? '');
  const motorista = motoristaDe(mundo, remessa?.motoristaId ?? '');
  const documentos = remessa ? documentosDe(mundo, remessa.id) : [];
  const eventos = remessa ? eventosDe(mundo, remessa.id) : [];
  const nota = documentos.find((d) => d.tipo === 'nfe');
  const manifesto = documentos.find((d) => d.tipo === 'mdfe');
  const pendencia = pendenciasDeRetorno(mundo).find((p) => p.remessa.id === remessa?.id);
  const marca = remessa ? marcaDeAtraso(remessa) : null;
  const equipamentoId = remessa?.itens[0]?.equipamentoId ?? null;
  const equipamento = mundo.equipamentos.find((e) => e.id === equipamentoId);
  const obraDeDestino = mundo.obras.find((o) => o.id === remessa?.destinoObraId);
  const precisaMover =
    obraDeDestino !== undefined &&
    equipamento !== undefined &&
    equipamento.obraId !== obraDeDestino.id;

  function dados(documento: DocumentoFiscal): DadosDoDocumento {
    return {
      empresa: TENANT.nome,
      cidade: TENANT.cidade,
      numero: documento.numero,
      chave: documento.chave,
      emitidoEm: documento.emitidoEm,
      natureza: operacao?.natureza ?? '—',
      cfop: operacao?.cfop ?? '',
      origem: remessa!.origemRotulo,
      destino: remessa!.destinoRotulo,
      placa: veiculo ? `${veiculo.placa} · ${veiculo.tipo} · ${veiculo.uf}` : '—',
      motorista: motorista?.nome ?? '—',
      itens: remessa!.itens.map((i) => ({
        descricao: i.descricao,
        quantidade: i.quantidade,
        unidade: i.unidade,
        valor: dinheiro(i.valorReferenciaCents),
      })),
      observacao:
        'CFOP ilustrativo, definido e assinado pelo contador da empresa. Documento gerado em ambiente de demonstracao, sem valor fiscal e sem transmissao a orgao nenhum.',
    };
  }

  /**
   * ⭐⭐ O PDF é montado no navegador, no carregamento da guia, a partir do que
   * está no livro. Não existe arquivo guardado, nem chamada a serviço nenhum.
   */
  useEffect(() => {
    if (documentos.length === 0) return;
    const feitos: Record<string, string> = {};
    for (const documento of documentos) {
      const bytes =
        documento.tipo === 'nfe'
          ? pdfDanfe(dados(documento))
          : pdfDamdfe(dados(documento), nota?.chave ?? '');
      feitos[documento.id] = comoEndereco(bytes);
    }
    setPdfs(feitos);
    return () => {
      Object.values(feitos).forEach((e) => URL.revokeObjectURL(e));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remessa?.id, documentos.length, eventos.length]);

  /**
   * ⚠️ **Imprimir manda o PDF para a impressora do aparelho.** A vitrine não tem
   * fila de impressão e não vai fingir que tem: quem imprime é o leitor de PDF
   * do navegador, numa moldura escondida — e a linha embaixo do botão avisa o
   * que fazer se o aparelho não abrir a impressão sozinho.
   */
  function imprimir(documentoId: string): void {
    const endereco = pdfs[documentoId];
    if (!endereco) return;
    const moldura = document.createElement('iframe');
    moldura.style.position = 'fixed';
    moldura.style.width = '0';
    moldura.style.height = '0';
    moldura.style.border = '0';
    moldura.src = endereco;
    moldura.addEventListener('load', () => {
      try {
        moldura.contentWindow?.focus();
        moldura.contentWindow?.print();
      } catch {
        // O leitor do navegador tem o próprio botão — e a tela já avisa.
      }
    });
    document.body.appendChild(moldura);
  }

  /**
   * ⛔ **A vitrine não manda nada sozinha.** O botão abre a conversa com o texto
   * pronto; quem aperta enviar é gente. Prometer envio automático de WhatsApp
   * antes de ele existir é a promessa mais fácil de cobrar depois.
   */
  function conversaComOMotorista(): string {
    const linhas = [
      `${TENANT.nome} — guia de transporte nº ${remessa!.numero}`,
      `${remessa!.origemRotulo} para ${remessa!.destinoRotulo}`,
      `Carga: ${remessa!.itens.map((i) => i.descricao).join(', ')}`,
      `Caminhão: ${veiculo?.placa ?? '—'}`,
      nota ? `Nota nº ${nota.numero} — chave ${nota.chave}` : '',
      manifesto ? `Manifesto nº ${manifesto.numero} — chave ${manifesto.chave}` : '',
      manifesto ? 'Ao entregar, avise para encerrar o manifesto.' : '',
      'Documentos de demonstração, sem valor fiscal.',
    ].filter((l) => l !== '');
    return `https://wa.me/${motorista?.telefone ?? ''}?text=${encodeURIComponent(linhas.join('\n'))}`;
  }

  if (!remessa) {
    return (
      <div className="mx-auto max-w-2xl">
        <Erro
          titulo="Esta saída não está no livro."
          dica="Ou o endereço veio errado, ou a demonstração foi recomeçada. Volte às remessas."
        />
        <div className="mt-4">
          <Link href="/remessas">
            <Botao tom="secundario">Voltar às remessas</Botao>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Sala
        titulo={`Saída nº ${remessa.numero}`}
        linha={`${operacao?.rotulo ?? '—'} · ${remessa.origemRotulo} para ${remessa.destinoRotulo}`}
        acao={
          <Link href="/remessas">
            <Botao tom="discreto">Voltar</Botao>
          </Link>
        }
      />

      {remessa.cancelada ? (
        <Cartao destaque className="mb-6 p-4">
          <p className="placa text-[11px] text-rust-bright">Remessa cancelada</p>
          <p className="mt-1.5 text-[14px] leading-snug text-chalk">{remessa.cancelada.motivo}</p>
          <p className="mt-1 text-[13px] text-concrete">
            Cancelada por {remessa.cancelada.por} em {data(remessa.cancelada.em)}. Os documentos
            continuam no livro — cancelar não apaga.
          </p>
        </Cartao>
      ) : null}

      {marca ? (
        <Cartao className="mb-6 p-4">
          <p className="placa text-[11px] text-concrete">Registrado depois do fato</p>
          <p className="mt-1.5 text-[14px] leading-snug text-chalk">{marca}</p>
          <p className="mt-1 text-[13px] text-concrete">
            A marca fica colada no fato, não escondida num histórico — é a primeira coisa que um
            auditor procura.
          </p>
        </Cartao>
      ) : null}

      {/* ── OS DOCUMENTOS ──────────────────────────────────────────────────── */}
      <section className="mb-8">
        <TituloSecao>Os documentos</TituloSecao>
        <div className="space-y-3">
          {documentos.map((documento) => {
            const estado = estadoDoDocumento(mundo, documento.id);
            const eMdfe = documento.tipo === 'mdfe';
            const aberto = eMdfe && estado === 'autorizado' && remessa.cancelada === null;
            return (
              <Cartao key={documento.id} className="p-4" destaque={aberto}>
                <div className="flex flex-wrap items-center gap-2">
                  <Etiqueta tom={aberto ? 'rust' : 'olive'}>
                    {eMdfe ? 'MDF-e · manifesto' : 'NF-e · nota'}
                  </Etiqueta>
                  <span className="num text-[13px] text-chalk">nº {documento.numero}</span>
                  <span className="text-[12px] text-concrete-dim">
                    {frasedoEstado(estado)} em {data(documento.emitidoEm)}
                  </span>
                </div>

                <p className="num mt-2 break-all text-[12px] leading-relaxed text-concrete">
                  {documento.chave}
                </p>
                <p className="text-[12px] text-concrete-dim">
                  Chave fictícia — não pertence a documento nenhum.
                </p>

                {aberto ? (
                  <p className="mt-2 text-[13px] leading-snug text-chalk">
                    Este manifesto está em aberto. Enquanto ninguém marcar “Chegou” na entrega, o
                    caminhão {veiculo?.placa ?? ''} não sai de novo.
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={pdfs[documento.id] ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={pdfs[documento.id] === undefined}
                  >
                    <Botao disabled={pdfs[documento.id] === undefined}>
                      {eMdfe ? 'Ver o manifesto (PDF)' : 'Ver a nota (PDF)'}
                    </Botao>
                  </a>
                  <Botao
                    tom="discreto"
                    disabled={pdfs[documento.id] === undefined}
                    onClick={() => imprimir(documento.id)}
                  >
                    Imprimir
                  </Botao>
                  {aberto ? (
                    <Botao tom="principal" onClick={() => setChegando(documento.id)}>
                      Chegou
                    </Botao>
                  ) : null}
                </div>
              </Cartao>
            );
          })}
        </div>

        <p className="mt-3 text-[13px] leading-snug text-concrete">
          O PDF é montado <span className="text-chalk">no instante do toque</span>, com os dados
          desta saída — e sai carimbado como demonstração, sem valor fiscal. Se a impressão não
          abrir sozinha, use o botão de imprimir do próprio leitor de PDF.
        </p>

        <div className="mt-3">
          <a href={conversaComOMotorista()} target="_blank" rel="noopener noreferrer">
            <Botao tom="secundario" larga>
              Enviar pro motorista
            </Botao>
          </a>
          <p className="mt-1.5 text-[13px] leading-snug text-concrete">
            Abre a conversa com o texto pronto — os números, a carga e o caminhão.{' '}
            <span className="text-chalk">Quem aperta enviar é você;</span> a vitrine não manda nada
            sozinha, e o envio automático ainda não existe.
          </p>
        </div>
      </section>

      {/* ── A CARGA E QUEM LEVA ────────────────────────────────────────────── */}
      <section className="mb-8">
        <TituloSecao>A carga e quem leva</TituloSecao>
        <Cartao className="p-4">
          {remessa.itens.map((i) => (
            <div key={i.descricao} className="flex items-start gap-3">
              <Maquina className="mt-0.5 h-5 w-5 shrink-0 text-concrete-dim" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] leading-snug text-chalk">{i.descricao}</p>
                <p className="mt-0.5 text-[13px] text-concrete">
                  {i.quantidade} {i.unidade} · valor de referência{' '}
                  {dinheiro(i.valorReferenciaCents)}
                </p>
              </div>
            </div>
          ))}
          <div className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-concrete">
            <p>
              Caminhão <span className="text-chalk">{veiculo?.placa ?? '—'}</span> ·{' '}
              {veiculo?.tipo ?? '—'}
            </p>
            <p>
              Motorista <span className="text-chalk">{motorista?.nome ?? '—'}</span>
            </p>
            <p>
              Operação <span className="text-chalk">{operacao?.natureza ?? '—'}</span> · CFOP{' '}
              {operacao?.cfop === '' ? '—' : operacao?.cfop}{' '}
              <span className="text-concrete-dim">(ilustrativo)</span>
            </p>
          </div>
        </Cartao>
      </section>

      {/* ── ⭐⭐ O RETORNO E O SEGUNDO ATO ──────────────────────────────────── */}
      {pendencia ? (
        <section className="mb-8">
          <TituloSecao>Ainda não voltou</TituloSecao>
          <Cartao className="p-4" destaque={pendencia.foraDoPrazo}>
            <p className="text-[14px] leading-snug text-chalk">
              Fora há {pendencia.diasFora} {pendencia.diasFora === 1 ? 'dia' : 'dias'}
              {pendencia.operacao.prazoRetornoDias !== null
                ? ` — o prazo desta operação é ${pendencia.operacao.prazoRetornoDias}`
                : ''}
              .
            </p>
            <p className="mt-1 text-[13px] leading-snug text-concrete">
              Ninguém marcou caixinha nenhuma: esta linha existe porque há saída sem retorno no
              livro, e ela some sozinha quando a volta entrar.
            </p>
            <div className="mt-3">
              <Botao tom="principal" onClick={() => setVoltando(true)}>
                Registrar retorno
              </Botao>
            </div>
          </Cartao>
        </section>
      ) : null}

      {precisaMover && remessa.cancelada === null ? (
        <section className="mb-8">
          <TituloSecao>E a máquina, mudou de obra?</TituloSecao>
          <Cartao className="p-4">
            <p className="text-[14px] leading-snug text-chalk">
              {equipamento!.nome} ainda consta em{' '}
              {mundo.obras.find((o) => o.id === equipamento!.obraId)?.nome ?? 'lugar não informado'}
              .
            </p>
            <p className="mt-1 text-[13px] leading-snug text-concrete">
              <span className="text-chalk">São dois atos, e é de propósito.</span> A guia é o ato de
              transporte; onde o bem fica é o cadastro do patrimônio. Se o segundo falhar, o
              primeiro fica de pé — a nota já saiu, e o sistema não pode fingir que não saiu.
            </p>
            <div className="mt-3">
              <Botao onClick={() => moverEquipamento(equipamento!.id, obraDeDestino!.id)}>
                Passar a máquina para {obraDeDestino!.nome}
              </Botao>
            </div>
          </Cartao>
        </section>
      ) : null}

      {/* ── O LIVRO ────────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <TituloSecao>O livro desta saída</TituloSecao>
        <Cartao>
          {eventos.map((e) => (
            <div key={e.id} className="border-b border-line px-4 py-3 last:border-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[14px] text-chalk">{NOME_DO_ATO[e.tipo]}</span>
                <span className="num text-[12px] text-concrete-dim">{data(e.registradoEm)}</span>
              </div>
              <p className="mt-0.5 text-[12px] text-concrete">
                por {e.por}
                {e.motivo ? ` · ${e.motivo}` : ''}
              </p>
            </div>
          ))}
        </Cartao>
        <p className="mt-3 text-[13px] leading-snug text-concrete">
          Nada aqui se edita e nada se apaga. Corrigir é registrar outro ato — e por isso existe
          cancelar com motivo, e não excluir.
        </p>
        {remessa.cancelada === null ? (
          <div className="mt-3">
            <Botao tom="perigo" onClick={() => setCancelando(true)}>
              Cancelar esta remessa
            </Botao>
          </div>
        ) : null}
      </section>

      <Confirmar
        aberto={chegando !== null}
        titulo="Marcar chegada"
        descricao="Isto encerra o manifesto deste caminhão. Sem encerrar, a próxima saída dele é recusada — e é por isso que o botão existe no celular do motorista."
        rotuloAcao="Chegou"
        tomAcao="principal"
        aoConfirmar={() => {
          if (chegando) marcarChegada(chegando, 'Sr. Aparecido');
          setChegando(null);
        }}
        aoFechar={() => setChegando(null)}
      />

      <Confirmar
        aberto={voltando}
        titulo="Registrar o retorno"
        descricao="Isto fecha a pendência de volta. A saída continua no livro, inteira — o retorno é outro ato, não uma correção do primeiro."
        rotuloAcao="Registrar retorno"
        tomAcao="principal"
        aoConfirmar={() => registrarRetorno(remessa.id, 'Sr. Aparecido')}
        aoFechar={() => setVoltando(false)}
      />

      <Confirmar
        aberto={cancelando}
        titulo="Cancelar a remessa"
        descricao="A remessa continua à vista, riscada, com quem cancelou e por quê. Não existe apagar."
        rotuloMotivo="Por que está cancelando"
        rotuloAcao="Cancelar a remessa"
        aoConfirmar={(motivo) => cancelarRemessa(remessa.id, motivo, 'Sr. Aparecido')}
        aoFechar={() => setCancelando(false)}
      />
    </div>
  );
}
