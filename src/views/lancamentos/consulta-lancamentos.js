import React from 'react'
import { withRouter } from 'react-router-dom'
import Card from '../../components/card'
import FormGroup from '../../components/form-group'
import SelectMenu from '../../components/selectMenu'
import LancamentosTable from './lancamentosTable'
import LancamentoService from '../../app/service/lancamentoService'
import LocalStorageService from '../../app/service/localStorageService'
import * as messages from '../../components/toastr'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'

class ConsultaLancamentos extends React.Component {

    state = {
        ano: '',
        mes: '',
        tipo: '',
        descricao: '',
        lancamentos: [],
        showConfirmDialog: false,
        lancamentoDeletar: {}
    }

    constructor() {
        super();
        this.service = new LancamentoService();
    }

    buscar = () => {
        if (!this.state.ano) {
            messages.mensagemErro('O preenchimento do campo ano é obrigatório.')
            return false;
        }

        const usuarioLogado = LocalStorageService.getItem('_usuario_logado')

        const lancamentoFiltro = {
            ano: this.state.ano,
            mes: this.state.mes,
            tipo: this.state.tipo,
            descricao: this.state.descricao,
            usuario: usuarioLogado.id
        }

        this.service.consultar(lancamentoFiltro)
            .then(resposta => {
                this.setState({ lancamentos: resposta.data })
            }).catch(error => {
                console.log(error)
            })
    }

    editar = (id) => {
        this.props.history.push(`/cadastro-lancamentos/${id}`)
    }

    prepataFormularioCadastro = () => {
        this.props.history.push('/cadastro-lancamentos')
    }

    abrirConfirmacao = (lancamento) => {
        this.setState({ showConfirmDialog: true, lancamentoDeletar: lancamento })
    }

    cancelarDelecao = (lancamento) => {
        this.setState({ showConfirmDialog: false, lancamentoDeletar: {} })
    }

    deletar = () => {
        this.service.deletar(this.state.lancamentoDeletar.id)
            .then(response => {
                const lancamentos = this.state.lancamentos;
                const index = lancamentos.indexOf(this.state.lancamentoDeletar)
                lancamentos.splice(index, 1);
                this.setState({ lancamentos: lancamentos, showConfirmDialog: false });
                messages.mensagemSucesso('Lançamento excluido.')
            }).catch(error => {
                messages.mensagemErro('Ocorreu um erro ao tentar deletar lançamento.')
            })
    }
    alterarStatus = (lancamento, status) => {
        this.service.alterarStatus(lancamento.id, status)
            .then(response => {
                const lancamentos = this.state.lancamentos;
                const index = lancamentos.indexOf(lancamento);
                if (index !== -1) {
                    lancamento['status'] = status;
                    lancamentos[index] = lancamento;
                    this.setState({lancamento})
                }
                messages.mensagemSucesso('Status atualizado com sucesso!')
            })
    }

    render() {
        const meses = this.service.obterListaMeses();
        const tipo = this.service.obterListaTipos();

        const confirmDialogFooter = (
            <div>
                <Button label="Confirmar" icon="pi pi-check" onClick={this.deletar} />
                <Button label="Cancelar" icon="pi pi-times" onClick={this.cancelarDelecao}
                    className="p-button-secundary"
                />
            </div>
        )

        return (
            <Card title="Consulta Lancamentos">
                <div className="row">
                    <div className="col-md-6">
                        <div className="bs-component">
                            <FormGroup htmlFor="inputAno" label="Ano: *">
                                <input type="text"
                                    className="form-control"
                                    id="inputAno"
                                    value={this.state.ano}
                                    onChange={e => this.setState({ ano: e.target.value })}
                                    placeholder="Digite o ano"
                                />
                            </FormGroup>
                            <FormGroup htmlFor="inputMes" label="Mes: *">
                                <SelectMenu id="inputMes"
                                    className="form-control"
                                    value={this.state.mes}
                                    onChange={e => this.setState({ mes: e.target.value })}
                                    lista={meses}
                                />
                            </FormGroup>
                            <FormGroup htmlFor="inputDesc" label="Descrição: ">
                                <input type="text"
                                    className="form-control"
                                    id="inputDesc"
                                    value={this.state.descricao}
                                    onChange={e => this.setState({ descricao: e.target.value })}
                                    placeholder="Digite a descrição"
                                />
                            </FormGroup>
                            <FormGroup htmlFor="inputTipo" label="Tipo Lançamento: *">
                                <SelectMenu
                                    id="inputTipo"
                                    className="form-control"
                                    value={this.state.tipo}
                                    onChange={e => this.setState({ tipo: e.target.value })}
                                    lista={tipo}
                                />
                            </FormGroup>
                            <button onClick={this.buscar} type="button" className="btn btn-success">Buscar</button>
                            <button onClick={this.prepataFormularioCadastro} type="button" className="btn btn-danger">Cadastrar</button>

                        </div>
                    </div>
                </div>
                <br />
                <div className="row">
                    <div className="col-md-12">
                        <div className="bs-component">
                            <LancamentosTable
                                lancamentos={this.state.lancamentos}
                                deleteAction={this.abrirConfirmacao}
                                editAction={this.editar}
                                alterarStatus={this.alterarStatus}
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <Dialog
                        headr="Godfather I"
                        visible={this.state.showConfirmDialog}
                        style={{ width: '50vw' }}
                        footer={confirmDialogFooter}
                        modal={true}
                        onHide={() => this.setState({ showConfirmDialog: false })}
                    >
                        Deseja confirmar a exclusão do lançamento?
                    </Dialog>
                </div>
            </Card>
        )
    }
}

export default withRouter(ConsultaLancamentos)