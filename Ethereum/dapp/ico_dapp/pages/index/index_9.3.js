import React from 'react';
import web3 from '../libs/web3';
import { Grid, Button, Typography, Card, CardContent, CardActions } from '@material-ui/core';
import { Link } from '../routes';
import ProjectList from '../libs/projectList';

import withRoot from '../libs/withRoot';
import Layout from '../components/Layout';

class Index extends React.Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         accounts: []
    //     };
    // }
    // async componentDidMount() {
    //     const accounts = await web3.eth.getAccounts();
    //     const balances = await Promise.all(accounts.map(x => web3.eth.getBalance(x)));

    //     console.log(accounts, balances);
    //     this.setState({ accounts: accounts.map((x, i) => ({ account: x, balance: balances[i] })) });

    // }
    static async getInitialProps({ req }) {
        const projects = await ProjectList.methods.getProjects().call();
        return { projects };
    }


    render() {
        // const { accounts } = this.state;
        const { projects } = this.props;

        return (
            <Layout>

                {/* <ul>
                    {accounts.map(x => (
                        <li key={x.account}>

                            {x.account} => {web3.utils.fromWei(x.balance, 'ether')}
                        </li>
                    ))}
                </ul> */}
                <Grid container spacing={16}>
                    {projects.map(this.renderProject)}
                </Grid>

            </Layout>
        )
    }
    renderProject(project) {
        return (
            <Grid item md={6} key={project}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="headline" component="h2">
                            {project}
                        </Typography>
                        <Typography component="p">{project}</Typography>
                    </CardContent>
                    <CardActions>
                        <Link route={`/projects/${project}`}>
                            <Button size="small" color="primary">
                                立即投资
                            </Button>
                        </Link>
                        <Link route={`/projects/${project}`}>
                            <Button size="small" color="secondary">
                                查看详情
                            </Button>
                        </Link>
                    </CardActions>
                </Card>
            </Grid>
        );
    }


}
export default withRoot(Index);
