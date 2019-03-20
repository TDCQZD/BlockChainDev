import React from 'react';
import { Grid, Button, Typography, LinearProgress, CircularProgress, Paper, TextField, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';
import { Link } from '../../routes';
import web3 from '../../libs/web3';
import Project from '../../libs/project';
import ProjectList from '../../libs/projectList';
import withRoot from '../../libs/withRoot';
import Layout from '../../components/Layout';
import InfoBlock from '../../components/InfoBlock';

class ProjectDetail extends React.Component {
    static async getInitialProps({ query }) {
        const contract = Project(query.address);

        const summary = await contract.methods.getSummary().call();
        const [description, minInvest, maxInvest, goal, balance, investorCount, paymentCount, owner] = Object.values(summary);

        const tasks = [];
        for (let i = 0; i < paymentCount; i++) {
            tasks.push(contract.methods.payments(i).call());
        }
        const payments = await Promise.all(tasks);


        const project = {
            address: query.address,
            description,
            minInvest,
            maxInvest,
            goal,
            balance,
            investorCount,
            paymentCount,
            owner,
            payments,

        };
        return { project };
    }
    constructor(props) {
        super(props);
        this.state = {
            amount: 0,
            errmsg: '',
            loading: false,
            isApproving: false,
            isPaying: false
        };
        this.onSubmit = this.contributeProject.bind(this);
    }
    async doPayment(i) {
        try {
            this.setState({ isPaying: i });

            // get accounts
            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0];

            // check account
            if (sender !== this.props.project.owner) {
                return window.alert('只有管理员才能划转资金');
            }

            // do payment
            const contract = Project(this.props.project.address);
            const result = await contract.methods
                .doPayment(i)
                .send({ from: sender, gas: '5000000' });

            window.alert('资金划转成功');

            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (err) {
            console.error(err);
            window.alert(err.message || err.toString());
        } finally {
            this.setState({ isPaying: false });
        }
    }

    async approvePayment(i) {
        try {
            this.setState({ isApproving: i });

            // get accounts
            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0];

            // approve payment
            const contract = Project(this.props.project.address);
            const isInvestor = await contract.methods.investors(sender).call();
            if (!isInvestor) {
                return window.alert('只有投资人才有权投票');
            }
            const result = await contract.methods
                .approvePayment(i)
                .send({ from: sender, gas: '5000000' });

            window.alert('投票成功');

            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (err) {
            console.error(err);
            window.alert(err.message || err.toString());
        } finally {
            this.setState({ isApproving: false });
        }
    }

    getInputHandler(key) {
        return e => {
            console.log(e.target.value);
            this.setState({ [key]: e.target.value });
        };
    }

    async contributeProject() {
        const { amount } = this.state;
        const { minInvest, maxInvest } = this.props.project;
        const minInvestInEther = web3.utils.fromWei(minInvest, 'ether');
        const maxInvestInEther = web3.utils.fromWei(maxInvest, 'ether');

        console.log({ amount, minInvestInEther, maxInvestInEther });

        // filed validation check
        if (amount <= 0) {
            return this.setState({ errmsg: '投资金额必须大于0' });
        }
        if (parseInt(amount) < parseInt(minInvestInEther)) {
            return this.setState({ errmsg: '投资金额必须大于最小投资金额' });
        }
        if (parseInt(amount) > parseInt(maxInvestInEther)) {
            return this.setState({ errmsg: '投资金额必须小于最大投资金额' });
        }

        try {
            this.setState({ loading: true, errmsg: '' });

            // get accounts
            const accounts = await web3.eth.getAccounts();
            const owner = accounts[0];

            // invest to project
            const contract = Project(this.props.project.address);
            const result = await contract.methods
                .contribute()
                .send({ from: owner, value: web3.utils.toWei(amount, 'ether'), gas: '5000000' });

            this.setState({ errmsg: '投资成功', amount: 0 });
            console.log(result);

            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (err) {
            console.error(err);
            this.setState({ errmsg: err.message || err.toString() });
        } finally {
            this.setState({ loading: false });
        }
    }



    render() {
        const { project } = this.props;

        return (
            <Layout>
                <Typography variant="title" color="inherit" style={{ margin: '15px 0' }}>
                    项目详情
                </Typography>
                {this.renderBasicInfo(project)}
                <Typography variant="title" color="inherit" style={{ margin: '30px 0 15px' }}>
                    资金支出请求
                </Typography>
                {this.renderPayments(project)}

            </Layout>
        );
    }
    renderPayments(project) {
        console.log(project);

        return (
            <Paper style={{ padding: '15px' }}>
                <Table style={{ marginBottom: '30px' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>用途</TableCell>
                            <TableCell>金额</TableCell>
                            <TableCell>收款方</TableCell>
                            <TableCell>完成状态</TableCell>
                            <TableCell>投票状态</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* {project.payments.map(payment => {
                            return (
                                <TableRow key={payment.id}>
                                    <TableCell>{payment.description}</TableCell>
                                    <TableCell numeric>{web3.utils.fromWei(payment.amount, 'ether')} ETH</TableCell>
                                    <TableCell>{payment.receiver}</TableCell>
                                    <TableCell>{payment.completed ? '是' : '否'}</TableCell>
                                    <TableCell>{payment.voterCount}/{project.investorCount}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            );
                        })} */}
                        {project.payments.map((payment, index) => this.renderPaymentRow(payment, index, project))}
                    </TableBody>
                </Table>

                <Link route={`/projects/${project.address}/payments/create`}>
                    <Button variant="raised" color="primary">
                        创建资金支出请求
                    </Button>
                </Link>
            </Paper>
        );
    }

    renderBasicInfo(project) {
        const progress = project.balance / project.goal * 100;

        return (
            <Paper style={{ padding: '15px' }}>
                <Typography gutterBottom variant="headline" component="h2">
                    {project.description}
                </Typography>
                <LinearProgress style={{ margin: '10px 0' }} color="primary" variant="determinate" value={progress} />
                <Grid container spacing={16}>
                    <InfoBlock title={`${web3.utils.fromWei(project.goal, 'ether')} ETH`} description="募资上限" />
                    <InfoBlock title={`${web3.utils.fromWei(project.minInvest, 'ether')} ETH`} description="最小投资金额" />
                    <InfoBlock title={`${web3.utils.fromWei(project.maxInvest, 'ether')} ETH`} description="最大投资金额" />
                    <InfoBlock title={`${project.investorCount}人`} description="参投人数" />
                    <InfoBlock title={`${web3.utils.fromWei(project.balance, 'ether')} ETH`} description="已募资金额" />
                </Grid>
                <Grid container spacing={16}>
                    <Grid item md={12}>
                        <TextField
                            required
                            id="amount"
                            label="投资金额"
                            style={{ marginRight: '15px' }}
                            value={this.state.amount}
                            onChange={this.getInputHandler('amount')}
                            margin="normal"
                            InputProps={{ endAdornment: 'ETH' }}
                        />
                        <Button size="small" variant="raised" color="primary" onClick={this.onSubmit}>
                            {this.state.loading ? <CircularProgress color="secondary" size={24} /> : '立即投资'}

                        </Button>
                        {!!this.state.errmsg && (
                            <Typography component="p" style={{ color: 'red' }}>
                                {this.state.errmsg}
                            </Typography>
                        )}

                    </Grid>
                </Grid>

            </Paper>
        );
    }
    renderPaymentRow(payment, index, project) {
        const canApprove = !payment.completed;
        const canDoPayment = !payment.completed && payment.voterCount / project.investorCount > 0.5;
        return (
            <TableRow key={payment.id}>
                <TableCell>{payment.description}</TableCell>
                <TableCell>{web3.utils.fromWei(payment.amount,'ether')} ETH</TableCell>
                <TableCell>{payment.receiver}</TableCell>
                <TableCell>{payment.completed ? '是' : '否'}</TableCell>
                <TableCell>{payment.voterCount}/{project.investorCount}</TableCell>
                <TableCell>
                    {canApprove && (
                        <Button size="small" color="primary" onClick={() => this.approvePayment(index)}>
                            {this.isApproving(index) ? <CircularProgress color="secondary" size={24} /> : '投赞成票'}
                        </Button>
                    )}
                    {/* const canDoPayment = !payment.completed && payment.voterCount / project.investorCount > 0.5; */}
                    {canDoPayment && (
                        <Button size="small" color="primary" onClick={() => this.doPayment(index)}>
                            {this.isPaying(index) ? <CircularProgress color="secondary" size={24} /> : "资金划转"}
                        </Button>
                    )}
                    
                </TableCell>
            </TableRow>
        );
    }
    isApproving(i) {
        return typeof this.state.isApproving === 'number' && this.state.isApproving === i;
    }
    isPaying(i) {
        return typeof this.state.isPaying === 'number' && this.state.isPaying === i;
    }


}
export default withRoot(ProjectDetail);
