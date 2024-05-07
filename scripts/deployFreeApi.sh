#!/bin/bash

# 容器名称和端口配置
containers=("kimi-free-api" "glm-free-api" "qwen-free-api" "step-free-api" "metaso-free-api" "spark-free-api" "emohaa-free-api" "hailuo-free-api")
# 在这里修改端口
ports=(8000 8001 8002 8003 8004 8005 8006 8007)


# 停止并删除容器
for i in "${!containers[@]}"; do
    container=${containers[$i]}
    echo "Processing $container..."
    if docker ps -a | grep -q $container; then
        echo "Stopping $container..."
        docker stop $container
        echo "Removing $container..."
        docker rm $container
    else
        echo "$container does not exist, skipping stop and remove."
    fi

    # 删除镜像
    image="vinlic/${container}"
    if docker images | grep -q $image; then
        echo "Removing image $image..."
        docker rmi $image
    else
        echo "Image $image does not exist, skipping remove."
    fi
done

# 如果指定了 -del 参数，那么脚本到此结束
if [ "$1" == "-del" ]; then
    echo "Deleted successfully"
    exit 0
fi

# 网络诊断
echo "Checking network connection to Docker Hub..."
if ! curl -s https://registry-1.docker.io/v2/ > /dev/null; then
    echo "Cannot connect to Docker Hub. Please check your network connection."
    exit 1
fi

# 拉取最新的镜像，并确保每个操作之间的顺序
for container in "${containers[@]}"; do
    echo ""
    echo "Pulling image for $container..."
    echo ""
    success=false
    for attempt in {1..3}; do
        if docker pull vinlic/${container}:latest; then
            echo "Successfully pulled $container image."
            success=true
            break
        else
            echo "Attempt $attempt failed, retrying..."
            sleep 5
        fi
    done
    if [ "$success" = false ]; then
        echo "Failed to pull $container image after several attempts. Stopping script."
        exit 1
    fi
done

# 运行新的容器
echo "Starting new containers..."
for i in "${!containers[@]}"; do
    container=${containers[$i]}
    port=${ports[$i]}
    echo ""
    echo "Starting container $((i+1)): $container on port $port"
    docker run -it -d --init --name $container -p $port:8000 -e TZ=Asia/Shanghai vinlic/${container}:latest
done