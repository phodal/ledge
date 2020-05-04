# 移动端 Android

## Android 原生

## 跨平台技术

## 平台化

组件化

插件化

## 移动中台

### 单体应用

### 模块化应用

### 容器化应用

## 持续集成

独立编译

联合打包

## 测试

![测试金字塔，显示了应用的测试套件应包含的三类测试](https://developer.android.google.cn/images/training/testing/pyramid_2x.png '测试金字塔')

沿着金字塔逐级向上，从小型测试到大型测试，各类测试的保真度逐级提高，但维护和调试工作所需的执行时间和工作量也逐级增加。因此，您编写的单元测试应多于集成测试，集成测试应多于端到端测试。虽然各类测试的比例可能会因应用的用例不同而异，但我们通常建议各类测试所占比例如下：**小型测试占 70%，中型测试占 20%，大型测试占 10%**。

### 单元测试（小型测试）

**用于验证应用的行为，一次验证一个类。**

**原则（`F.I.R.S.T`）**

**F**ast(快)，单元测试要运行的足够快，单个测试方法一般要立即（一秒之内）给出结果。  
**I**dependent(独立)，测试方法之间不要有依赖（先执行某个测试方法，再执行另一个测试方法才能通过）。  
**R**epeatable（重复），可以在本地或 CI 不同环境（机器上）上反复执行，不会出现不稳定的情况。  
**S**elf-Validating（自验证），单元测试必须包含足够多的断言进行自我验证。  
**T**imely（及时），理想情况下应测试先行，至少保证单元测试应该和实现代码一起及时完成并提交。

除此之外，测试代码应该具备最好的**可读性**和最少的**维护代价**，绝大多数情况下写测试应该就像用**领域特定语言描述一个事实**，甚至**不用经过仔细地思考**。

#### 本地单元测试

**当需要更快地运行测试而不需要与在真实设备上运行测试关联的保真度和置信度时，可以使用本地单元测试来验证应用的逻辑。**

- 如果测试对`Android`框架有依赖性（特别是与框架建立复杂交互的测试），则最好使用 `Robolectric`添加框架依赖项。

> 例：待测试的类同时依赖`Context`、`Intent`、`Bundle`、`Application`等`Android Framework`中的类时，此时我们可以引入`Robolectric`框架进行本地单元测试的编写。

- 如果测试对`Android`框架的依赖性极小，或者如果测试仅取决于我们自己应用的对象，则可以使用诸如`Mockito`之类的模拟框架添加模拟依赖项。([BasicUnitAndroidTest](https://github.com/android/testing-samples/tree/master/unit/BasicUnitAndroidTest))

> 例：待测试的类只依赖`java api`（最理想的情况）,此时对于待测试类所依赖的其他类我们就可以利用`Mockito`框架 mock 其依赖类，再进行当前类的单元测试编写。([EmailValidatorTest](https://github.com/android/testing-samples/blob/master/unit/BasicSample/app/src/test/java/com/example/android/testing/unittesting/BasicSample/EmailValidatorTest.java))

> 例：待测试的类除了依赖`java api`外仅依赖`Android Framework`中`Context`这个类,此时我们就可以利用`Mockito`框架`mock` `Context`类，再进行当前类的单元测试编写。([SharedPreferencesHelperTest](https://github.com/android/testing-samples/blob/master/unit/BasicSample/app/src/test/java/com/example/android/testing/unittesting/BasicSample/SharedPreferencesHelperTest.java))

#### 设置测试环境

在`Android Studio`项目中，本地单元测试的源文件存储在`module-name/src/test/java/`中。

在模块的顶级`build.gradle`文件中，将以下库指定为依赖项：

```groovy
    dependencies {
        // Required -- JUnit 4 framework
        testImplementation "junit:junit:$junitVersion"
        // Optional -- Mockito framework
        testImplementation "org.mockito:mockito-core:$mockitoCoreVersion"

        // Optional -- Robolectric environment
       testImplementation "androidx.test:core:$xcoreVersion"
       testImplementation "androidx.test.ext:junit:$extJunitVersion"
       testImplementation "org.robolectric:robolectric:$robolectricVersion"
    }
```

如果单元测试依赖于资源，需要在 module 的 build.gradle 文件中启用`includeAndroidResources`选项。然后，单元测试可以访问编译版本的资源，从而使测试更快速且更准确地运行。

```groovy
    android {
        // ...

        testOptions {
            unitTests {
                includeAndroidResources = true
            }
        }
    }
```

```java
@RunWith(AndroidJUnit4::class)
@Config(manifest = Config.NONE)
class PeopleDaoTest {
    private lateinit var database: PeopleDatabase

    private lateinit var peopleDao: PeopleDao

    @Before
    fun `create db`() {
        database = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            PeopleDatabase::class.java
        ).allowMainThreadQueries().build()

        peopleDao = database.peopleDao()
    }

    @Test
    fun `should return empty list when getPeople without inserted data`() {
        val result = peopleDao.getPeople(pageId = 1)

        assertThat(result).isNotNull()
        assertThat(result).isEmpty()
    }
```

如果单元测试包含异步操作时，可以使用 [awaitility 库](https://github.com/awaitility/awaitility)进行测试；当使用[RxJava](https://github.com/ReactiveX/RxJava)响应式编程库时，可以自定义 rule：

```java
class RxJavaRule : TestWatcher() {
    override fun starting(description: Description?) {
        super.starting(description)

        RxJavaPlugins.setIoSchedulerHandler {
            Schedulers.trampoline()
        }
        RxJavaPlugins.setNewThreadSchedulerHandler {
            Schedulers.trampoline()
        }
        RxJavaPlugins.setComputationSchedulerHandler {
            Schedulers.trampoline()
        }

        RxAndroidPlugins.setMainThreadSchedulerHandler {
            Schedulers.trampoline()
        }
        RxAndroidPlugins.setInitMainThreadSchedulerHandler {
            Schedulers.trampoline()
        }
    }

    override fun finished(description: Description?) {
        super.finished(description)

        RxJavaPlugins.reset()

        RxAndroidPlugins.reset()
    }
}
```

`TestScheduler`中`triggerActions`的使用。

```java
@RunWith(JUnit4::class)
class FilmViewModelTest {
    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()
    @get:Rule
    val rxJavaRule = RxJavaRule()

    private val repository = mock(Repository::class.java)

    private val testScheduler = TestScheduler()

    private lateinit var viewModel: FilmViewModel

    @Before
    fun init() {
        viewModel = FilmViewModel(repository)
    }

    @Test
    fun `should return true when loadFilms is loading`() {
        `when`(repository.getPopularFilms(1)).thenReturn(
            Single.just(emptyList<Film>())
                .subscribeOn(testScheduler)
        )

        viewModel.loadFilms(0)

        assertThat(getValue(viewModel.isLoading)).isTrue()
        testScheduler.triggerActions()
        assertThat(getValue(viewModel.isLoading)).isFalse()
    }

    @Test
    fun `should return films list when loadFilms successful`() {
        `when`(repository.getPopularFilms(1)).thenReturn(
            Single.just(
                listOf(
                    Film(123, "", "", "", "", "", "", 1)
                )
            ).subscribeOn(testScheduler)
        )

        viewModel.loadFilms(0)

        assertThat(getValue(viewModel.films)).isNull()
        testScheduler.triggerActions()
        assertThat(getValue(viewModel.films)).isNotNull()
        assertThat(getValue(viewModel.films).size).isEqualTo(1)
    }
}
```

`TestSubscriber`的使用。

```java
@RunWith(JUnit4::class)
class WebServiceTest {
    private lateinit var webService: WebService

    private lateinit var mockWebServer: MockWebServer

    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()

    @Before
    fun `start service`() {
        mockWebServer = MockWebServer()

        webService = Retrofit.Builder()
            .baseUrl(mockWebServer.url("/"))
            .addConverterFactory(GsonConverterFactory.create())
            .addCallAdapterFactory(RxJava2CallAdapterFactory.create())
            .build()
            .create(WebService::class.java)
    }

    @Test
    fun `should return fim list when getFilms successful`() {
        assertThat(webService).isNotNull()

        enqueueResponse("popular_films.json")

        val testObserver = webService.getPopularFilms(page = 1)
            .map {
                it.data
            }.test()

        testObserver.assertNoErrors()
        testObserver.assertValueCount(1)
        testObserver.assertValue {
            assertThat(it).isNotEmpty()
            assertThat(it[0].id).isEqualTo(297761)
            assertThat(it[1].id).isEqualTo(324668)
            it.size == 2
        }
        testObserver.assertComplete()
        testObserver.dispose()
    }

    @After
    fun `stop service`() {
        mockWebServer.shutdown()
    }

    private fun enqueueResponse(fileName: String) {
        val inputStream = javaClass.classLoader?.getResourceAsStream("api-response/$fileName")
            ?: return
        val source = inputStream.source().buffer()
        val mockResponse = MockResponse()
        mockWebServer.enqueue(
            mockResponse
                .setBody(source.readString(Charsets.UTF_8))
        )
    }
}

```

插桩单元测试

### 集成测试（中型测试）

> 四大组件（Activity、Service、BroadcastReceiver、ContentProvider）测试

### UI 测试（大型测试）

- Espresso
- UIAutomator

## 发布

热更新与热修复

灰度发布

## APM
