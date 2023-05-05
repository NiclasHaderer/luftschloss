Open ports for Kubernetes
The open ports on the Kubernetes master node are:

- 6443: Kubernetes API server
- 2379-2380: etcd server client API
- 10250: Kubelet API
- 10259: kube-scheduler
- 10257: kube-controller-manager

For the master node, run

```shell
sudo iptables -A INPUT -p tcp --dport 6443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 2379:2380 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 10250 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 10259 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 10257 -j ACCEPT
sudo service iptables save
sudo service iptables restart
```

The open ports on the Kubernetes worker nodes are:

- 10250: Kubelet API
- 30000-32767: NodePort Services

For the worker nodes, run

```shell
sudo iptables -A INPUT -p tcp --dport 10250 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 30000:32767 -j ACCEPT
sudo service iptables save
sudo service iptables restart
```

````shell



Connect kubectl to the cluster by downloading the config file from the cluster




```shell
scp -r student226@145.100.135.226:/home/student226/.kube .
````
