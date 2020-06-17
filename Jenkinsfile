pipeline {
  agent {
    docker { 
      image 'node:12'
      reuseNode true
      args '-v /usr/local/share/.cache/yarn/:/usr/local/share/.cache/yarn/'
    }
  }
  stages {
    stage('检出') {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: [[name: env.GIT_BUILD_REF]], 
          userRemoteConfigs: [[url: env.GIT_REPO_URL, credentialsId: env.CREDENTIALS_ID]]
        ])
      }
    }
    stage('安装依赖') {
      steps {
        sh '''find /etc/apt/ -name "*.list" -print0 |
        xargs -0 sed -i "s/[a-z]\\+.debian.org/mirrors.cloud.tencent.com/g"
        '''
        sh 'apt-get update'
        sh "apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2" +
           " libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4" +
           " libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0" +
           " libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1" +
           " libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6" +
           " libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation" +
           " libappindicator1 libnss3 lsb-release xdg-utils wget python3-pip"
        sh 'yarn install'
      }
    }
    stage('检查代码规范') {
      steps {
        sh 'yarn lint'
      }
    }
    stage('构建') {
      steps {
        sh 'yarn build:ci'
      }
    }
    stage('测试') {
      steps {
        sh 'yarn test:ci'
      }
    }
    stage('部署到腾讯云存储') {
      when {
        anyOf {
          branch 'master'
          tag '*'
        }
      }
      steps {
        sh 'pip3 install coscmd'
        sh "coscmd config -a $COS_SECRET_ID -s $COS_SECRET_KEY" +
           " -b $COS_BUCKET_NAME -r $COS_BUCKET_REGION"
        sh 'coscmd upload -r dist/ledge/ /'
      }
    }
  }
}
