<?php

namespace Tests\Feature\Controllers\Banner;

use App\Http\Controllers\App\Banner\BannerController;
use App\Helper\ToolsHelper;
use App\Models\BannerModel;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Mockery;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class BannerControllerTest extends TestCase
{
    protected $bannerMock;
    protected $toolsHelperMock;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Fake Storage 'public' agar file tidak benar-benar tersimpan di disk
        // Ini menggantikan kebutuhan Mockery untuk Storage::disk
        Storage::fake('public');

        // 2. Mock Inertia::always
        Inertia::shouldReceive('always')
            ->andReturnUsing(function ($value) {
                return Mockery::mock('overload:Inertia\AlwaysProp', [
                    'getValue' => $value,
                ]);
            });

        // 3. Mock Model dengan alias
        $this->bannerMock = Mockery::mock('alias:' . BannerModel::class);

        // 4. Mock Helper Static
        $this->toolsHelperMock = Mockery::mock('alias:' . ToolsHelper::class);
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
        $auth = (object) ['id' => 1, 'akses' => ['Banner']];
        $request = Request::create('/banner', 'GET');
        $request->attributes->set('auth', $auth);

        $this->toolsHelperMock->shouldReceive('checkRoles')
            ->with('Banner', $auth->akses)
            ->andReturn(true);

        $this->bannerMock->shouldReceive('query')->andReturn($this->bannerMock);
        $this->bannerMock->shouldReceive('when')->andReturn($this->bannerMock);
        $this->bannerMock->shouldReceive('orderBy')->with('urutan', 'asc')->andReturn($this->bannerMock);
        $this->bannerMock->shouldReceive('paginate')->with(5)->andReturn('paginateData');

        $captured = [];
        $mockResp = Mockery::mock(Response::class);

        Inertia::shouldReceive('render')
            ->once()
            ->with('app/banner/banner-page', Mockery::capture($captured))
            ->andReturn($mockResp);

        $controller = new BannerController;
        $res = $controller->index($request);

        $this->assertSame($mockResp, $res);
        $this->assertEquals('paginateData', $captured['bannerList']());
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function index_with_search()
    {
        $auth = (object) ['id' => 1, 'akses' => ['Banner']];
        $request = Request::create('/banner', 'GET', ['search' => 'promo']);
        $request->attributes->set('auth', $auth);

        $this->toolsHelperMock->shouldReceive('checkRoles')->andReturn(true);
        $this->bannerMock->shouldReceive('query')->andReturn($this->bannerMock);

        // Intercept when(search, callback)
        $this->bannerMock->shouldReceive('when')
            ->once()
            ->with('promo', Mockery::type('callable'))
            ->andReturnUsing(function ($search, $callback) {
                $callback($this->bannerMock, $search);
                return $this->bannerMock;
            });

        // Intercept nested where inside when
        $this->bannerMock->shouldReceive('where')
            ->once()
            ->with(Mockery::type('callable'))
            ->andReturnUsing(function ($cb) {
                $cb($this->bannerMock);
                return $this->bannerMock;
            });

        $this->bannerMock->shouldReceive('whereRaw')
            ->with('LOWER(nama_banner) LIKE ?', ["%promo%"])
            ->andReturn($this->bannerMock);
        
        $this->bannerMock->shouldReceive('orWhereRaw')
            ->with('LOWER(url_gambar) LIKE ?', ["%promo%"])
            ->andReturn($this->bannerMock);

        $this->bannerMock->shouldReceive('orderBy')->andReturn($this->bannerMock);
        $this->bannerMock->shouldReceive('paginate')->with(5)->andReturn('searchData');

        $captured = [];
        $mockResp = Mockery::mock(Response::class);

        Inertia::shouldReceive('render')
            ->once()
            ->with('app/banner/banner-page', Mockery::capture($captured))
            ->andReturn($mockResp);

        (new BannerController)->index($request);
        $this->assertEquals('searchData', $captured['bannerList']());
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function post_change_fails_without_access()
    {
        $auth = (object) ['id' => 1, 'akses' => ['User']];
        $request = Request::create('/banner/change', 'POST');
        $request->attributes->set('auth', $auth);

        $this->toolsHelperMock->shouldReceive('checkRoles')
            ->with('Banner', $auth->akses)
            ->andReturn(false);

        (new BannerController)->postChange($request);

        $this->assertEquals(
            'Anda tidak memiliki izin untuk mengolah banner.',
            session('error')
        );
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function post_change_creates_new_banner()
    {
        $auth = (object) ['id' => 1, 'akses' => ['Banner']];
        $request = Request::create('/banner/change', 'POST');
        $request->attributes->set('auth', $auth);

        // Upload Fake File
        $file = UploadedFile::fake()->image('banner.jpg');
        $request->files->set('gambar', $file);

        $request->merge([
            'nama_banner' => 'Banner Baru',
            'shown' => '1',
        ]);

        $this->toolsHelperMock->shouldReceive('checkRoles')->andReturn(true);
        $this->bannerMock->shouldReceive('max')->with('urutan')->andReturn(5);

        // Karena kita pakai Storage::fake(), store() akan menghasilkan hashName
        // Kita gunakan Mockery::on untuk memverifikasi struktur data saja, bukan path exact
        $this->bannerMock->shouldReceive('create')
            ->once()
            ->with(Mockery::on(function ($data) {
                return $data['nama_banner'] === 'Banner Baru'
                    && $data['urutan'] === 6
                    && str_contains($data['url_gambar'], '/storage/banners/') // Cek folder
                    && $data['shown'] == '1';
            }))
            ->andReturnTrue();

        (new BannerController)->postChange($request);

        $this->assertEquals('Banner berhasil ditambahkan.', session('success'));
        
        // Assert file tersimpan di disk fake
        // File store akan tersimpan di banners/{hashName}.jpg
        // Karena hashName random, kita hanya cek direktori tidak kosong atau cara spesifik jika perlu
        $files = Storage::disk('public')->files('banners');
        $this->assertNotEmpty($files);
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function post_change_updates_existing_banner_with_image()
    {
        // 1. Setup Auth & Request
        $auth = (object) ['id' => 1, 'akses' => ['Banner']];
        $request = Request::create('/banner/change', 'POST');
        $request->attributes->set('auth', $auth);

        // 2. Setup File Baru & Input
        $file = UploadedFile::fake()->image('new-banner.jpg');
        $request->files->set('gambar', $file);

        $request->merge([
            'bannerId' => 'uuid-123',
            'nama_banner' => 'Updated Banner',
            'shown' => '0',
        ]);

        $this->toolsHelperMock->shouldReceive('checkRoles')->andReturn(true);

        // 3. Setup File Lama di Fake Storage
        // Kita harus membuat file "lama" secara manual di fake disk agar bisa dihapus oleh controller
        Storage::disk('public')->put('banners/old.jpg', 'content');
        
        // Assert file lama ada
        Storage::disk('public')->assertExists('banners/old.jpg');

        // 4. Mock Banner Existing
        $existingBanner = Mockery::mock();
        $existingBanner->id_banner = 'uuid-123';
        $existingBanner->url_gambar = '/storage/banners/old.jpg';
        $existingBanner->shouldIgnoreMissing(); 
        $existingBanner->shouldReceive('save')->once()->andReturnTrue();

        // 5. Query Mock
        $this->bannerMock->shouldReceive('where')
            ->with('id_banner', 'uuid-123')
            ->andReturn($this->bannerMock);
        $this->bannerMock->shouldReceive('first')->andReturn($existingBanner);

        // 6. Jalankan Controller
        (new BannerController)->postChange($request);

        // 7. Assertions
        $this->assertEquals('Banner berhasil diperbarui.', session('success'));
        
        // Pastikan nama berubah di object
        $this->assertEquals('Updated Banner', $existingBanner->nama_banner);
        
        // Pastikan URL gambar berubah menjadi file baru
        $this->assertStringContainsString('/storage/banners/', $existingBanner->url_gambar);
        $this->assertStringNotContainsString('old.jpg', $existingBanner->url_gambar);

        // Pastikan file lama terhapus dari disk
        Storage::disk('public')->assertMissing('banners/old.jpg');
        
        // Pastikan file baru ada (kita cek folder banners punya lebih dari 0 file)
        $this->assertNotEmpty(Storage::disk('public')->files('banners'));
    }

    #[Test]
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function post_delete_success()
    {
        $auth = (object) ['id' => 1, 'akses' => ['Banner']];
        $request = Request::create('/banner/delete', 'POST');
        $request->attributes->set('auth', $auth);

        $request->merge([
            'bannerIds' => ['uuid-1', 'uuid-2'],
        ]);

        $this->toolsHelperMock->shouldReceive('checkRoles')->andReturn(true);

        // Setup File untuk dihapus
        Storage::disk('public')->put('banners/img1.jpg', 'content');
        Storage::disk('public')->assertExists('banners/img1.jpg');

        // Mock Data Banners
        $banner1 = Mockery::mock();
        $banner1->url_gambar = '/storage/banners/img1.jpg';
        $banner1->shouldReceive('delete')->once();

        $banner2 = Mockery::mock();
        $banner2->url_gambar = null; // Case tanpa gambar
        $banner2->shouldReceive('delete')->once();

        $this->bannerMock->shouldReceive('whereIn')
            ->with('id_banner', ['uuid-1', 'uuid-2'])
            ->andReturn($this->bannerMock);
        
        $this->bannerMock->shouldReceive('get')->andReturn(collect([$banner1, $banner2]));

        // Transaction Mock (Force execute)
        DB::shouldReceive('transaction')
            ->once()
            ->with(Mockery::type('callable'))
            ->andReturnUsing(function ($callback) {
                $callback();
            });

        (new BannerController)->postDelete($request);

        $this->assertEquals('Banner yang dipilih berhasil dihapus.', session('success'));
        
        // Assert file 1 terhapus
        Storage::disk('public')->assertMissing('banners/img1.jpg');
    }
}