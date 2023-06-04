import { useEffect, useState } from "react";
import { Button, Form, Grid, Header, Segment, Divider, Message } from "semantic-ui-react";
import SHA256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";
import crypto from "crypto-js";
import { useForm } from "react-hook-form";

const digest = (domain: string, handle: string, key: string) => {
  let hasher = crypto.algo.HMAC.create(crypto.algo.SHA512, key);
  hasher.update(domain.length.toString());
  hasher.update("#");
  hasher.update(handle.length.toString());
  hasher.update("#");
  hasher.update(domain);
  hasher.update(handle);
  return hasher.finalize();
};

const default_length = 16;

const App = () => {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const [keyHash, setKeyHash] = useState<string>("");
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    register("domain", { required: true });
    register("handle", { required: true });
    register("key", { required: true });
    register("rawLength");
  }, []);

  const onSubmit = (data: any) => {
    const { domain, handle, key, rawLength } = data;
    const length = rawLength === undefined ? default_length : rawLength;
    const rawPass = digest(domain, handle, key);
    const pass = Base64.stringify(rawPass).slice(0, length);

    navigator.clipboard.writeText(pass).then(() => {
      setOk(true);
    }).catch((err) => {
      setErr(err.toString());
    });
  };

  const change = (name: string, value: string) => {
    setValue(name, value);
    setOk(false);
    setErr("");
  };

  return (
    <Grid textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" textAlign="center">Keychain</Header>
        <Form size="large" onSubmit={handleSubmit(onSubmit)}>
          <Segment>
            <Form.Input fluid icon="globe" iconPosition="left" placeholder="Domain" name="domain" onChange={(_, { name, value }) => change(name, value)} />
            <Form.Input fluid icon="user" iconPosition="left" placeholder="Handle" name="handle" onChange={(_, { name, value }) => change(name, value)} />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Primary Key"
              type="password"
              name="key"
              onChange={(_, { name, value }) => {
                change(name, value);
                // 先编码成 UTF-8，所以没有问题
                setKeyHash(Base64.stringify(SHA256(value)))
              }
              }
            />
            <Form.Input value={keyHash} disabled />
            <Button fluid size="large">
              Get!
            </Button>
            <Divider />
            <Form.Input fluid placeholder={`Length (Default: ${default_length})`} type="number" name="rawLength" max="32" onChange={(_, { name, value }) => change(name, value)} />
          </Segment>
        </Form>
        {
          ok &&
          <Message positive>
            <Message.Header>Copied to clipboard!</Message.Header>
          </Message>
        }
        {
          err !== "" &&
          <Message error>
            <Message.Header>{err}</Message.Header>
          </Message>
        }
      </Grid.Column>
    </Grid>
  );
};

export default App
