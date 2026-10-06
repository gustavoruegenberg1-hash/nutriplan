import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import {
  Award,
  User,
  Mail,
  Lock,
  Phone,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const RegisterProfessional: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Etapa 1: Dados Pessoais
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Etapa 2: Dados Profissionais
  const [specialty, setSpecialty] = useState<'NUTRITIONIST' | 'TRAINER'>('NUTRITIONIST');
  const [councilNumber, setCouncilNumber] = useState('');
  const [councilState, setCouncilState] = useState('SP');
  const [bio, setBio] = useState('');

  // Etapa 3: Documento de Comprovação
  const [documentFileName, setDocumentFileName] = useState('');
  const [documentBase64, setDocumentBase64] = useState('');

  const councilLabel = specialty === 'NUTRITIONIST' ? 'CRN' : 'CREF';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDocumentFileName(file.name);
      setDocumentBase64(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    if (!name.trim()) return 'Informe seu nome completo.';
    if (!email.trim() || !email.includes('@')) return 'Informe um e-mail válido.';
    if (password.length < 8) return 'A senha deve conter no mínimo 8 caracteres.';
    return null;
  };

  const validateStep2 = () => {
    if (!councilNumber.trim()) return `Informe seu número de registro profissional (${councilLabel}).`;
    if (!councilState.trim()) return 'Selecione o estado (UF) do conselho.';
    return null;
  };

  const validateStep3 = () => {
    if (!documentFileName) return 'Anexe a cópia da sua carteira profissional ou diploma para validação do conselho.';
    return null;
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) return setError(err);
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) return setError(err);
      setStep(3);
    } else if (step === 3) {
      const err = validateStep3();
      if (err) return setError(err);
      setStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/professionals/register', {
        name,
        email,
        password,
        phone,
        specialty,
        councilType: councilLabel,
        councilNumber: `${councilLabel} ${councilNumber}/${councilState}`,
        councilState,
        bio,
        documentName: documentFileName,
        documentData: documentBase64,
      });

      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Falha ao submeter cadastro de profissional.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Cadastro Enviado com Sucesso!</h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Seus dados e comprovante de registro <strong className="text-slate-200">({councilLabel} {councilNumber}/{councilState})</strong> foram recebidos.
              O status da sua conta é <span className="text-amber-400 font-bold">EM ANÁLISE (PENDING)</span>.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 text-xs text-slate-400 text-left space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-teal-400" />
              <span>Processo de Homologação Profissional:</span>
            </div>
            <p>1. A moderação administrativa confere seu registro ativo no respectivo conselho regional.</p>
            <p>2. Assim que aprovado, você terá acesso imediato ao painel de atendimento e gestão de alunos.</p>
            <p>3. Você já pode fazer login na plataforma para acompanhar o andamento da sua solicitação.</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
          >
            Ir para a Tela de Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold">
            <Award size={14} />
            <span>Credenciamento de Especialistas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cadastro de Profissional
          </h1>
          <p className="text-slate-400 text-sm">
            Junte-se à rede de nutricionistas e treinadores homologados do NutriPlan
          </p>
        </div>

        {/* Indicador Visual de Etapas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className={step >= 1 ? 'text-emerald-400' : ''}>1. Dados Pessoais</span>
            <span className={step >= 2 ? 'text-emerald-400' : ''}>2. Registro</span>
            <span className={step >= 3 ? 'text-emerald-400' : ''}>3. Documentos</span>
            <span className={step >= 4 ? 'text-emerald-400' : ''}>4. Revisão</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ETAPA 1: DADOS PESSOAIS */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Dra. Juliana Silveira"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">E-mail Profissional</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@clinica.com.br"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 2: DADOS PROFISSIONAIS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Área de Atuação</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSpecialty('NUTRITIONIST')}
                    className={`p-4 rounded-xl border text-left transition flex flex-col gap-1 ${
                      specialty === 'NUTRITIONIST'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-sm">Nutricionista</span>
                    <span className="text-xs text-slate-400">Conselho Regional de Nutrição (CRN)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpecialty('TRAINER')}
                    className={`p-4 rounded-xl border text-left transition flex flex-col gap-1 ${
                      specialty === 'TRAINER'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-sm">Treinador / EF</span>
                    <span className="text-xs text-slate-400">Educação Física (CREF)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                    Número do {councilLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={councilNumber}
                    onChange={(e) => setCouncilNumber(e.target.value)}
                    placeholder="Ex: 12345"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">UF do Conselho</label>
                  <select
                    value={councilState}
                    onChange={(e) => setCouncilState(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Biografia / Apresentação</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Descreva brevemente sua formação acadêmica, abordagem clínica e público atendido..."
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>
            </div>
          )}

          {/* ETAPA 3: DOCUMENTOS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <FileText size={16} className="text-emerald-400" />
                  <span>Instruções para Comprovação Profissional:</span>
                </div>
                <p>Envie uma foto legível ou PDF da sua Cédula de Identidade Profissional emitida pelo {councilLabel} ou diploma homologado pelo MEC.</p>
                <p>Tamanho máximo permitido: 5MB.</p>
              </div>

              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500/60 transition cursor-pointer relative bg-slate-800/20">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload size={32} className="mx-auto text-emerald-400 mb-2" />
                <span className="font-semibold text-white text-sm block">Clique para selecionar seu documento</span>
                <span className="text-xs text-slate-400 mt-1 block">Formatos aceitos: PDF, JPG, PNG</span>
              </div>

              {documentFileName && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Arquivo selecionado: <strong>{documentFileName}</strong></span>
                  </div>
                  <span className="text-[11px] text-slate-400">Pronto para envio</span>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 4: REVISÃO DOS DADOS */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm">Resumo da Solicitação</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block">Profissional:</span>
                    <strong className="text-white">{name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">E-mail:</span>
                    <strong className="text-white">{email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Especialidade:</span>
                    <strong className="text-emerald-400">{specialty === 'NUTRITIONIST' ? 'Nutricionista' : 'Treinador / EF'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Registro:</span>
                    <strong className="text-white">{councilLabel} {councilNumber}/{councilState}</strong>
                  </div>
                </div>

                {documentFileName && (
                  <div className="pt-2 border-t border-slate-700/60">
                    <span className="text-slate-500 block">Documento Comprobatório:</span>
                    <span className="text-slate-200">{documentFileName}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Building2 size={15} />
                  <span>Declaração de Veracidade</span>
                </div>
                <p>
                  Declaro sob as penas da lei que os dados informados são autênticos e que possuo habilitação profissional válida perante os órgãos regulamentadores de classe.
                </p>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-white transition"
              >
                Já tem conta? Faça Login
              </Link>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition flex items-center gap-1.5 ml-auto"
              >
                <span>Avançar</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-sm transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50 ml-auto"
              >
                {loading ? 'Submetendo...' : 'Concluir Cadastro'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
