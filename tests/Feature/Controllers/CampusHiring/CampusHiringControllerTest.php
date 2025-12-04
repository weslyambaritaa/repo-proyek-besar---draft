<?php

namespace Tests\Feature\Controllers\CampusHiring;

use App\Http\Controllers\App\CampusHiring\CampusHiringController;
use App\Models\CampusHiringModel;
use App\Models\PerusahaanModel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Mockery;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CampusHiringControllerTest extends TestCase
{
    protected $campusHiringMock;

    protected $perusahaanMock;

    protected function setUp(): void
    {
        parent::setUp();

        // Mock Inertia::always
        Inertia::shouldReceive('always')
            ->andReturnUsing(function ($value) {
                return Mockery::mock('overload:Inertia\AlwaysProp', [
                    'getValue' => $value,
                ]);
            });

        // Mock Models dengan alias agar kita bisa memanipulasi method static
        $this->campusHiringMock = Mockery::mock('alias:'.CampusHiringModel::class);
        $this->perusahaanMock = Mockery::mock('alias:'.PerusahaanModel::class);

        // --- MOCK STATIC METHOD getJenisOptions ---
        // Method ini dipanggil di controller index dan postChange
        $this->campusHiringMock->shouldReceive('getJenisOptions')
            ->zeroOrMoreTimes()
            ->andReturn(['Full Time', 'Part Time', 'Contract']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function index_render_default()
    {
        // Setup Auth dengan role yang sesuai
        $auth = (object) ['id' => 1, 'akses' => ['Campus Hiring']];
        $request = Request::create('/app/campus-hiring', 'GET');
        $request->attributes->set('auth', $auth);

        // Expectation: Dropdown lists (Perusahaan)
        $this->perusahaanMock->shouldReceive('all')->once()->andReturn(['p1']);

        // Expectation: Query Campus Hiring
        $this->campusHiringMock->shouldReceive('query')->andReturn($this->campusHiringMock);
        $this->campusHiringMock->shouldReceive('where')
            ->with('id_admin_pembuat', 1)
            ->andReturn($this->campusHiringMock);

        // when(search) -> tidak dijalankan/null
        $this->campusHiringMock->shouldReceive('when')->andReturn($this->campusHiringMock);

        $this->campusHiringMock->shouldReceive('orderByDesc')->andReturn($this->campusHiringMock);
        $this->campusHiringMock->shouldReceive('paginate')
            ->with(5) // Default perPage
            ->andReturn('paginateData');

        $captured = [];
        $mockResp = Mockery::mock(Response::class);

        Inertia::shouldReceive('render')
            ->once()
            ->with('app/campus-hiring/campus-hiring-page', Mockery::capture($captured))
            ->andReturn($mockResp);

        $controller = new CampusHiringController;
        $res = $controller->index($request);

        // Verifikasi hasil
        $this->assertSame($mockResp, $res);
        $this->assertEquals('paginateData', $captured['campusHiringList']());
        $this->assertEquals(['p1'], $captured['perusahaanList']);
        // Verifikasi array statis yang kita mock
        $this->assertEquals(['Full Time', 'Part Time', 'Contract'], $captured['jenisLowonganList']);
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function index_with_search()
    {
        $auth = (object) ['id' => 1, 'akses' => ['Campus Hiring']];
        $request = Request::create('/app/campus-hiring', 'GET', ['search' => 'java']);
        $request->attributes->set('auth', $auth);

        $this->perusahaanMock->shouldReceive('all')->once()->andReturn([]);

        $this->campusHiringMock->shouldReceive('query')->andReturn($this->campusHiringMock);
        $this->campusHiringMock->shouldReceive('where')
            ->with('id_admin_pembuat', 1)
            ->andReturn($this->campusHiringMock);

        // intercept when(search, callback)
        $this->campusHiringMock->shouldReceive('when')
            ->once()
            ->with('java', Mockery::type('callable'))
            ->andReturnUsing(function ($search, $callback) {
                // Jalankan callback query search
                $callback($this->campusHiringMock, $search);

                return $this->campusHiringMock;
            });

        // intercept where(fn($q) => ...) inside the when
        $this->campusHiringMock->shouldReceive('where')
            ->once()
            ->with(Mockery::type('callable'))
            ->andReturnUsing(function ($cb) {
                $cb($this->campusHiringMock);

                return $this->campusHiringMock;
            });

        // Sesuai controller: whereRaw -> orWhereRaw -> orWhereRaw
        $this->campusHiringMock->shouldReceive('whereRaw')->once()->andReturn($this->campusHiringMock);
        $this->campusHiringMock->shouldReceive('orWhereRaw')->times(2)->andReturn($this->campusHiringMock);

        $this->campusHiringMock->shouldReceive('orderByDesc')->andReturn($this->campusHiringMock);
        $this->campusHiringMock->shouldReceive('paginate')->with(5)->andReturn('searchData');

        $captured = [];
        $mockResp = Mockery::mock(Response::class);

        Inertia::shouldReceive('render')
            ->once()
            ->with('app/campus-hiring/campus-hiring-page', Mockery::capture($captured))
            ->andReturn($mockResp);

        $controller = new CampusHiringController;
        $controller->index($request);

        $this->assertEquals('searchData', $captured['campusHiringList']());
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function index_per_page_invalid_defaults_to_5()
    {
        $auth = (object) ['id' => 1, 'akses' => ['Campus Hiring']];
        $request = Request::create('/app/campus-hiring', 'GET', ['perPage' => 0]);
        $request->attributes->set('auth', $auth);

        $this->perusahaanMock->shouldReceive('all')->once()->andReturn([]);

        $this->campusHiringMock->shouldReceive('query')->andReturn($this->campusHiringMock);
        $this->campusHiringMock->shouldReceive('where')->andReturn($this->campusHiringMock);
        $this->campusHiringMock->shouldReceive('when')->andReturn($this->campusHiringMock);
        $this->campusHiringMock->shouldReceive('orderByDesc')->andReturn($this->campusHiringMock);

        // Memastikan default ke 5 jika input 0
        $this->campusHiringMock->shouldReceive('paginate')
            ->with(5)
            ->andReturn('defaultData');

        $captured = [];
        $mockResp = Mockery::mock(Response::class);

        Inertia::shouldReceive('render')
            ->once()
            ->with('app/campus-hiring/campus-hiring-page', Mockery::capture($captured))
            ->andReturn($mockResp);

        $controller = new CampusHiringController;
        $controller->index($request);

        $this->assertEquals('defaultData', $captured['campusHiringList']());
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function post_change_fails_without_access()
    {
        // User roles tidak memiliki 'Campus Hiring'
        $auth = (object) ['id' => 1, 'akses' => ['User']];
        $request = Request::create('/app/campus-hiring/change', 'POST');
        $request->attributes->set('auth', $auth);

        (new CampusHiringController)->postChange($request);

        $this->assertEquals(
            'Anda tidak memiliki izin untuk mengolah data Campus Hiring.',
            session('error')
        );
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function post_change_creates_new_campus_hiring()
    {
        $auth = (object) ['id' => 1, 'akses' => ['Campus Hiring']];
        $request = Request::create('/app/campus-hiring/change', 'POST');
        $request->attributes->set('auth', $auth);

        $request->merge([
            'id_perusahaan' => '1',
            'jenis_lowongan' => 'Full Time',
            'nama_campus_hiring' => 'IT Trainee',
            // Field lain opsional dalam testing create ini jika validasi lolos
        ]);

        $this->campusHiringMock->shouldReceive('create')
            ->once()
            ->with(Mockery::on(fn ($data) => $data['nama_campus_hiring'] === 'IT Trainee' &&
                $data['id_admin_pembuat'] === 1 &&
                $data['jenis_lowongan'] === 'Full Time'
            ))
            ->andReturnTrue();

        (new CampusHiringController)->postChange($request);

        $this->assertEquals(
            'Campus Hiring berhasil ditambahkan.',
            session('success')
        );
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function post_change_update_fails_when_not_found()
    {
        $auth = (object) ['id' => 1, 'akses' => ['Campus Hiring']];
        $request = Request::create('/app/campus-hiring/change', 'POST');
        $request->attributes->set('auth', $auth);

        // ID disediakan -> Mode Update
        $request->merge([
            'id_campus_hiring' => '999',
            'id_perusahaan' => '1',
            'jenis_lowongan' => 'Full Time',
            'nama_campus_hiring' => 'Error Job',
        ]);

        $this->campusHiringMock->shouldReceive('where')
            ->with('id_campus_hiring', '999')
            ->andReturn($this->campusHiringMock);

        $this->campusHiringMock->shouldReceive('where')
            ->with('id_admin_pembuat', 1)
            ->andReturn($this->campusHiringMock);

        // Tidak ditemukan
        $this->campusHiringMock->shouldReceive('first')->andReturnNull();

        (new CampusHiringController)->postChange($request);

        $this->assertEquals(
            'Data tidak ditemukan atau Anda tidak memiliki akses.',
            session('error')
        );
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function post_change_updates_existing_campus_hiring()
    {
        $auth = (object) ['id' => 1, 'akses' => ['Campus Hiring']];
        $request = Request::create('/app/campus-hiring/change', 'POST');
        $request->attributes->set('auth', $auth);

        $request->merge([
            'id_campus_hiring' => '10',
            'id_perusahaan' => '1',
            'jenis_lowongan' => 'Part Time',
            'nama_campus_hiring' => 'Updated Job',
            'kualifikasi_pendidikan' => ['S1'],
            'departemen' => 'IT',
        ]);

        $existing = Mockery::mock();
        $existing->shouldIgnoreMissing();
        $existing->shouldReceive('save')->once()->andReturnTrue();

        $this->campusHiringMock->shouldReceive('where')
            ->with('id_campus_hiring', '10')
            ->andReturn($this->campusHiringMock);

        $this->campusHiringMock->shouldReceive('where')
            ->with('id_admin_pembuat', 1)
            ->andReturn($this->campusHiringMock);

        $this->campusHiringMock->shouldReceive('first')->andReturn($existing);

        (new CampusHiringController)->postChange($request);

        $this->assertEquals(
            'Campus Hiring berhasil diperbarui.',
            session('success')
        );
        // Memastikan assignment ke object terjadi
        $this->assertEquals('Updated Job', $existing->nama_campus_hiring);
        $this->assertEquals('IT', $existing->departemen);
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function post_delete_fails_without_access()
    {
        $auth = (object) ['id' => 1, 'akses' => ['User']];
        $request = Request::create('/app/campus-hiring/delete', 'POST');
        $request->attributes->set('auth', $auth);

        (new CampusHiringController)->postDelete($request);

        $this->assertEquals(
            'Anda tidak memiliki izin untuk mengolah data Campus Hiring.',
            session('error')
        );
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function post_delete_success()
    {
        $auth = (object) ['id' => 1, 'akses' => ['Campus Hiring']];
        $request = Request::create('/app/campus-hiring/delete', 'POST');
        $request->attributes->set('auth', $auth);

        $request->merge([
            'ids_campus_hiring' => ['1', '2'], // Nama parameter array di controller
        ]);

        $this->campusHiringMock->shouldReceive('whereIn')
            ->with('id_campus_hiring', ['1', '2'])
            ->andReturn($this->campusHiringMock);

        $this->campusHiringMock->shouldReceive('where')
            ->with('id_admin_pembuat', 1)
            ->andReturn($this->campusHiringMock);

        $this->campusHiringMock->shouldReceive('delete')->once()->andReturnTrue();

        (new CampusHiringController)->postDelete($request);

        $this->assertEquals(
            'Data Campus Hiring yang dipilih berhasil dihapus.',
            session('success')
        );
    }
}
